const app = getApp()
const localData = require("../../pages/index/localData.js").localData;

const tcosUrl = "https://metro-1252278458.cos.ap-beijing.myqcloud.com/";


var mpInfo = null;



var avilHeight = 0;
var avilWidth = 750;
var pxHeight = 0;
var pxWidth = 0;
var rpx2px = 0;

var currX = 0;
var currY = 0;
var currV = 0;
var prevTop = 0;
var prevLeft = 0;
var zoomFlag = false;

var allowDownload = false;
var advShare = false;
var sharePath = null;


Page({

  data: {
    rtn: "\n",

    appVer: "1.1.0",


    svgUrl: null,
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

    sideMenuTxt: ["重置缩放", "项目主页", "下载PDF", "项目说明"],

    iconB64: localData.iconB64,
    crosshairB64: localData.crosshairB64,
    mtrmpInfo:localData.mtrmpInfo,

  },


  onLoad() {
    wx.showLoading({
      title: "数据加载中",
      mask: true,
    });

    this.getScreenSize();
    this.pullDataFromCos();

    wx.setNavigationBarTitle({ title: "列车运行前方", })

    this.resetZoom();
    this.paraZoom();
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



  getScreenSize() {
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
    })
  },

  pullDataFromCos() {
    const that = this;
    wx.request({
      url: tcosUrl + "mpVars/mtr.json",
      method: "GET",
      success: function (res) {
        mpInfo = res.data;

        that.setData({
          mpInfo,
          msgBox2btnTxt: "下载PDF",
          svgUrl: tcosUrl + "svg/MTR" + mpInfo.mtrVer + ".svg",
          tcosUrl,
        });

        wx.hideLoading({});
        allowDownload = true;
      },
    })
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
      return; F
    }

    if (idx == 0) {
      this.setData({ msgBoxShow: false });
      this.resetZoom();
    } else if (idx < 4) {
      this.setData({
        msgBoxShow: true,
        msgBoxIdx: idx,
      })
    }
  },

  copyLink: function (evt) {
    wx.setClipboardData({
      data: "https://gitee.com/SierraQin/metro",
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

    wx.downloadFile({
      url: tcosUrl + "MTR/MTR" + mpInfo.mtrVer + ".pdf",
      success(res) {
        allowDownload = false;
        that.setData({ msgBox2btnTxt: "已下载" });
        fsm.copyFileSync(res.tempFilePath, wx.env.USER_DATA_PATH + "/MTR" + mpInfo.mtrVer + ".pdf");
        wx.shareFileMessage({
          filePath: wx.env.USER_DATA_PATH + "/MTR" + mpInfo.mtrVer + ".pdf",
          fileName: "MTR" + mpInfo.mtrVer + ".pdf",
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
      title: "下一次分享小程序时将会附带当前显示位置和缩放等级信息",
      icon: "none",
      duration: 3000,
    });
    this.setData({ msgBoxShow: false });
    advShare = true;
  },

  enableCrossHair: function (evt) {
    this.setData({
      crosshairShow: true,
      msgBoxShow: false,
    });
    wx.showToast({
      title: "已显示十字准心",
      icon: "none",
      duration: 3000,
    });
  },


});
