const app = getApp()
const localData = require("../../pages/index/localData.js").localData;

const { Base64 } = require('js-base64');

const tcosUrl = "https://metro-1252278458.cos.ap-beijing.myqcloud.com/";


var mpInfo = null;
var repoInfoA = null;
var repoInfoB = null;


var avilHeight = 0;
const avilWidth = 750;
var pxHeight = 0;
var pxWidth = 0;
var rpx2px = 0;

var currX = 0;
var currY = 0;
var currV = 0;
var prevTop = 0;
var prevLeft = 0;
var zoomFlag = false;
var tZoomFlag = false;



var z_initZoom = 0;
var z_initDist = 0;
var z_x = 0;
var z_y = 0;
var z_px_x = 0;
var z_px_y = 0;


var allowDownload = false;
var advShare = false;
var sharePath = null;

var prodSvg = null;
var devSvg = null;
var funMeter = 0;



Page({

  data: {
    rtn: "\n",

    appVer: "1.3.1",

    tcosUrl: null,
    mpInfo: null,

    avilHeight: 0,
    rpx2px: 0,

    zoom: 100,
    zoomBarVar: 0,
    scrollTop: 0,
    scrollLeft: 0,

    msgBoxShow: false,
    msgBoxIdx: 0,
    msgBox2btnTxt: "数据加载中",

    crosshairShow: false,

    sideMenuTxt: ["重置缩放", "项目说明", "下载PDF", "开发预览"],

    iconB64: localData.iconB64,
    crosshairB64: localData.crosshairB64,
    mtrmpInfo: localData.mtrmpInfo,
    privacyInfo: localData.privacyInfo,

    svgUri: null,
    enableDev: false,
    viewDev: false,
    pdfVer: "加载中...",
    currInfo: "{ 加载中... }",

    showCmitInfo: false,
    cmitInfo1: "",
    cmitInfo2: "",
    cmitHash: "加载中...",

  },


  onLoad() {
    const that = this;

    wx.setNavigationBarTitle({ title: "列车运行前方", });

    wx.showLoading({
      title: "数据加载中",
      mask: true,
    });

    wx.getSystemInfo({
      success: (info) => {
        pxHeight = info.windowHeight;
        pxWidth = info.windowWidth;
        avilHeight = parseInt(750 * info.windowHeight / info.windowWidth);
        rpx2px = info.windowWidth / 750;
        this.setData({
          avilHeight,
          rpx2px,
        });
      },
    });

    wx.request({
      url: tcosUrl + "mpVars/mtr.json",
      method: "GET",
      success: function (res) {
        mpInfo = res.data;

        that.setData({
          mpInfo,
          msgBox2btnTxt: "下载PDF",
          tcosUrl,
        });

        allowDownload = true;

        wx.request({
          url: tcosUrl + "svg/MTR" + mpInfo.mtrVer + ".svg",
          method: "GET",
          success: function (r) {
            prodSvg = "data:image/svg+xml;base64," + Base64.encode(r.data);
            that.setData({
              svgUri: prodSvg,
              currInfo: "{ MTR" + mpInfo.mtrVer + ".svg , " + mpInfo.mtrDate + " , SierraQin , CC BY-SA 4.0 }",
            });
            wx.hideLoading({});

            // 弹窗
            that.setData({
              msgBoxShow: true,
              msgBoxIdx: 4,
            });
            setTimeout(function () {
              if (that.data.msgBoxShow && that.data.msgBoxIdx == 4) {
                that.setData({ msgBoxShow: false });
              }
            }, 10000);
            // End of 弹窗

            that.setData({ pdfVer: that.data.mpInfo.mtrVer });

            that.resetZoom();
            that.paraZoom();
          },
        });
      },
    });

  },

  onShareAppMessage: function () {
    if (advShare) {
      sharePath = "/pages/index/index?x=" + currX + "&y=" + currY + "&v=" + currV;
      advShare = false;
    } else {
      sharePath = "/pages/index/index";
    }

    return {
      title: "北京轨道交通线路配置图",
      desc: "版本" + mpInfo.mtrVer,
      imageUrl: tcosUrl + "img/mpShare.png",
      path: sharePath
    };
  },

  mtrDevLazyLoad() {
    if (this.data.enableDev) {
      return;
    }

    const that = this;
    // const giteePublicKey = mpInfo.publicKey;
    const apiUrl = "https://api.qinxr.cn/gh/metro/v1/getCommitsInfo";


    wx.request({
      url: "https://mtr.qinxr.cn/src/MTR2.svg",
      method: "GET",
      success: function (res) {
        devSvg = "data:image/svg+xml;base64," + Base64.encode(res.data);

        wx.request({
          url: apiUrl,
          method: "GET",
          success: function (r) {
            repoInfoB = r.data[0];
            if (r.data.length > 0) {
              that.setData({
                cmitHash: "dev-" + repoInfoB.sha.slice(0, 7),
                enableDev: true,
                cmitInfo1: "[ " + repoInfoB.sha.slice(0, 7) + " ] " + repoInfoB.commit.committer.date.slice(0, 10) + " " + repoInfoB.commit.committer.date.slice(11, 19) + " by " + repoInfoB.commit.committer.name,
                cmitInfo2: repoInfoB.commit.message,
              });
              console.log("[debug] Done!");
            }
          },
        });


      },
    });

  },



  zoomTo(x, y, v) {
    var a = 750 * Math.pow(10, v / 50) * rpx2px;
    this.setData({
      scrollTop: y * a - pxHeight / 2 + "px",
      scrollLeft: x * a - pxWidth / 2 + "px",
      zoom: Math.pow(10, v / 50),
      zoomBarVar: v,
    });
    zoomFlag = true;
    prevTop = y * a - pxHeight / 2;
    prevLeft = x * a - pxWidth / 2;
  },

  resetZoom() {
    this.zoomTo(0.37954144864798395, 0.47718281717983047, 56);
  },

  paraZoom() {
    var str = wx.getEnterOptionsSync().query;
    if (str.x > 0 && str.x < 1 && str.y > 0 && str.y < 1 && str.v >= 0 && str.v <= 100) {
      this.zoomTo(str.x, str.y, str.v);
    }
  },



  zooming: function () {
    var p = this.data.zoom;
    var z = Math.pow(10, this.data.zoomBarVar / 50);
    var t = ((prevTop + pxHeight / 2) * (z / p) - (pxHeight / 2)) + "px";
    var l = ((prevLeft + pxWidth / 2) * (z / p) - (pxWidth / 2)) + "px";
    this.setData({
      scrollTop: t,
      scrollLeft: l,
      zoom: z,
    });
    zoomFlag = true;
    prevTop = t;
    prevLeft = l;
  },

  getScrollPos: function (evt) {
    if (zoomFlag) {
      if (evt.detail.scrollTop != prevTop || evt.detail.scrollLeft != prevLeft) {
        this.setData({
          scrollTop: prevTop,
          scrollLeft: prevLeft,
        });
      }
    }
    zoomFlag = false;
    prevTop = evt.detail.scrollTop;
    prevLeft = evt.detail.scrollLeft;

    var a = 750 * this.data.zoom * rpx2px;
    currV = this.data.zoomBarVar;
    currX = (prevLeft + pxWidth / 2) / a;
    currY = (prevTop + pxHeight / 2) / a;
    console.log('[debug] Curr zoom para: "?x=' + currX + "&y=" + currY + "&v=" + currV + '"');
  },

  sideMenuActions: function (evt) {
    var idx = parseInt(evt.currentTarget.id.slice(3));

    if (this.data.msgBoxShow && this.data.msgBoxIdx == idx) {
      this.setData({ msgBoxShow: false });
      return;
    }

    if (idx == 0) {
      this.setData({ msgBoxShow: false });
      this.resetZoom();
      this.resetZoom();
    } else if (idx == 3) {
      this.mtrDevLazyLoad();
      this.setData({
        msgBoxShow: true,
        msgBoxIdx: idx,
      })
    } else if (idx < 4) {
      this.setData({
        msgBoxShow: true,
        msgBoxIdx: idx,
      })
    }
  },

  copyLink: function (evt) {
    wx.setClipboardData({
      data: "https://github.com/SierraQin/metro",
    });
  },

  downloadPdf: function (evt) {
    const that = this;

    if (!allowDownload) {
      return;
    }

    wx.showLoading({
      title: "下载中...",
      mask: true,
    });

    allowDownload = false;
    that.setData({ msgBox2btnTxt: "请稍候" });

    const fsm = wx.getFileSystemManager();

    var fileName = ""
    var pdfUrl = ""

    if (this.data.viewDev) {
      var cDate = repoInfoB.commit.committer.date;
      fileName = "MTR" + cDate.slice(2, 4) + cDate.slice(5, 7) + cDate.slice(8, 10) + "_" + this.data.pdfVer + ".pdf"
      pdfUrl = "https://mtr.qinxr.cn/build/" + fileName;
    } else {
      fileName = "MTR" + mpInfo.mtrVer + ".pdf"
      pdfUrl = tcosUrl + "MTR/" + fileName;
    }

    wx.downloadFile({
      url: pdfUrl,
      success(res) {
        allowDownload = false;
        that.setData({ msgBox2btnTxt: "已下载" });
        fsm.copyFileSync(res.tempFilePath, wx.env.USER_DATA_PATH + "/" + fileName);
        wx.shareFileMessage({
          filePath: wx.env.USER_DATA_PATH + "/" + fileName,
          fileName: fileName,
          fail: function () {
            allowDownload = true;
            that.setData({ msgBox2btnTxt: "下载PDF" });
          },
          complete: function () {
            wx.hideLoading({});
          }
        });
      },
      fail: function () {
        allowDownload = true;
        that.setData({ msgBox2btnTxt: "下载PDF" });
        wx.hideLoading({});
      }
    })
  },

  hideMsgBox: function (evt) {
    this.setData({ msgBoxShow: false });
  },

  enableAdvShare: function (evt) {
    wx.showToast({
      title: "下次分享将附带当前显示位置和缩放",
      icon: "none",
      duration: 3000,
    });
    this.setData({ msgBoxShow: false });
    advShare = true;
  },

  enableCrossHair: function (evt) {
    this.setData({
      crosshairShow: !this.data.crosshairShow,
      msgBoxShow: false,
    });
  },

  devView: function (evt) {
    wx.showLoading({
      title: "切换中",
      mask: true,
    });

    allowDownload = true;
    this.setData({ msgBox2btnTxt: "下载PDF" });

    this.setData({ msgBoxShow: false });

    if (this.data.viewDev) {
      var cDate = repoInfoB.commit.committer.date;
      this.setData({
        svgUri: devSvg,
        currInfo: "{ dev-" + repoInfoB.sha.slice(0, 7) + " , " + repoInfoB.commit.committer.date.slice(0, 10) + " , SierraQin , CC BY-SA 4.0 }",
        //pdfVer: cDate.slice(2, 4) + cDate.slice(5, 7) + cDate.slice(8, 10) + "_dev-" + repoInfoB.sha.slice(0, 7),
        pdfVer: "dev-" + repoInfoB.sha.slice(0, 7),
        showCmitInfo: true,
      });
    } else {
      this.setData({
        svgUri: prodSvg,
        currInfo: "{ MTR" + mpInfo.mtrVer + ".svg , " + mpInfo.mtrDate + " , SierraQin , CC BY-SA 4.0 }",
        pdfVer: this.data.mpInfo.mtrVer,
        showCmitInfo: false,
      });
    }

    wx.hideLoading({});
  },




  touchStartEvt: function (evt) {
    if (evt.touches.length != 2) {
      return;
    }

    z_initZoom = this.data.zoom;
    z_initDist = Math.sqrt((evt.touches[0].pageX - evt.touches[1].pageX) * (evt.touches[0].pageX - evt.touches[1].pageX) + (evt.touches[0].pageY - evt.touches[1].pageY) * (evt.touches[0].pageY - evt.touches[1].pageY));
    z_px_x = (evt.touches[0].clientX + evt.touches[1].clientX) / 2;
    z_px_y = (evt.touches[0].clientY + evt.touches[1].clientY) / 2;
    z_x = (prevLeft + z_px_x) / (rpx2px * this.data.zoom * 750);
    z_y = (prevTop + z_px_y) / (rpx2px * this.data.zoom * 750);
  },

  touchMoveEvt: function (evt) {
    if (evt.touches.length != 2) {
      return;
    }

    var dist = Math.sqrt((evt.touches[0].pageX - evt.touches[1].pageX) * (evt.touches[0].pageX - evt.touches[1].pageX) + (evt.touches[0].pageY - evt.touches[1].pageY) * (evt.touches[0].pageY - evt.touches[1].pageY));
    var A = 750 * z_initZoom * dist / z_initDist * rpx2px;

    var newZoom = z_initZoom * dist / z_initDist;
    if (newZoom >= 100 || newZoom < 1) {
      return;
    }

    this.setData({
      zoom: newZoom,
      scrollTop: z_y * A - z_px_y,
      scrollLeft: z_x * A - z_px_x,
    });

    tZoomFlag = true;
  },

  touchEndEvt: function (evt) {
    if (!tZoomFlag) {
      return;
    }

    this.setData({ zoomBarVar: Math.log10(this.data.zoom) * 50 });

    /* 
        var a = 750 * this.data.zoom * rpx2px;
        prevTop = this.data.scrollLeft;
        prevLeft = this.data.scrollTop;
        currV = Math.log10(this.data.zoom) * 50;
        this.setData({ zoomBarVar: currV });
        currX = (prevLeft + pxWidth / 2) / a;
        currY = (prevTop + pxHeight / 2) / a;
        console.log('[debug] Curr zoom* para: "?x=' + currX + "&y=" + currY + "&v=" + currV + '"');
     */

  },

  somethingFun: function (evt) {
    funMeter++;
    if (funMeter == 5) {
      wx.showToast({
        title: "已经没有彩蛋啦",
        icon: "error",
        duration: 3000
      })
    } else if (funMeter == 20) {
      wx.showToast({
        title: "试试点击底部版本号",
        icon: "none",
        duration: 3000
      })
    } else if (funMeter == 40) {
      wx.showToast({
        title: "试试点击隐私及数据说明",
        icon: "none",
        duration: 3000
      })
    } else if (funMeter > 50) {
      wx.showToast({
        title: "别点啦，这次真没啦",
        icon: "error",
        duration: 3000
      })
    }

  },

});
