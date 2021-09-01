const app = getApp()

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

    appVer: "1.0.1",
    appBuild: "2",


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

    iconB64: ["data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0yMSAzOEMzMC4zODg4IDM4IDM4IDMwLjM4ODggMzggMjFDMzggMTEuNjExMiAzMC4zODg4IDQgMjEgNEMxMS42MTEyIDQgNCAxMS42MTEyIDQgMjFDNCAzMC4zODg4IDExLjYxMTIgMzggMjEgMzhaIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDMzODAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMSAxNUwyMSAyNyIgc3Ryb2tlPSIjMDAzMzgwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNSAyMUwyNyAyMSIgc3Ryb2tlPSIjMDAzMzgwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMy4yMjE4IDMzLjIyMThMNDEuNzA3MSA0MS43MDcxIiBzdHJva2U9IiMwMDMzODAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+", "data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMS45ODQgMEExMiAxMiAwIDAgMCAwIDEyYTEyIDEyIDAgMCAwIDEyIDEyIDEyIDEyIDAgMCAwIDEyLTEyQTEyIDEyIDAgMCAwIDEyIDBhMTIgMTIgMCAwIDAtLjAxNiAwem02LjA5IDUuMzMzYy4zMjggMCAuNTkzLjI2Ni41OTIuNTkzdjEuNDgyYS41OTQuNTk0IDAgMCAxLS41OTMuNTkySDkuNzc3Yy0uOTgyIDAtMS43NzguNzk2LTEuNzc4IDEuNzc4djUuNjNjMCAuMzI3LjI2Ni41OTIuNTkzLjU5Mmg1LjYzYy45ODIgMCAxLjc3OC0uNzk2IDEuNzc4LTEuNzc4di0uMjk2YS41OTMuNTkzIDAgMCAwLS41OTItLjU5M2gtNC4xNWEuNTkyLjU5MiAwIDAgMS0uNTkyLS41OTJ2LTEuNDgyYS41OTMuNTkzIDAgMCAxIC41OTMtLjU5Mmg2LjgxNWMuMzI3IDAgLjU5My4yNjUuNTkzLjU5MnYzLjQwOGE0IDQgMCAwIDEtNCA0SDUuOTI2YS41OTMuNTkzIDAgMCAxLS41OTMtLjU5M1Y5Ljc3OGE0LjQ0NCA0LjQ0NCAwIDAgMSA0LjQ0NS00LjQ0NGg4LjI5NloiIGZpbGw9IiMwMDMzODAiLz48L3N2Zz4=", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01IDhDNSA2Ljg5NTQzIDUuODk1NDMgNiA3IDZIMTlMMjQgMTJINDFDNDIuMTA0NiAxMiA0MyAxMi44OTU0IDQzIDE0VjQwQzQzIDQxLjEwNDYgNDIuMTA0NiA0MiA0MSA0Mkg3QzUuODk1NDMgNDIgNSA0MS4xMDQ2IDUgNDBWOFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMzM4MCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMwIDI4TDIzLjk5MzMgMzRMMTggMjguMDEzNCIgc3Ryb2tlPSIjMDAzMzgwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNCAyMFYzNCIgc3Ryb2tlPSIjMDAzMzgwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0yNCA0NEMyOS41MjI4IDQ0IDM0LjUyMjggNDEuNzYxNCAzOC4xNDIxIDM4LjE0MjFDNDEuNzYxNCAzNC41MjI4IDQ0IDI5LjUyMjggNDQgMjRDNDQgMTguNDc3MiA0MS43NjE0IDEzLjQ3NzIgMzguMTQyMSA5Ljg1Nzg2QzM0LjUyMjggNi4yMzg1OCAyOS41MjI4IDQgMjQgNEMxOC40NzcyIDQgMTMuNDc3MiA2LjIzODU4IDkuODU3ODYgOS44NTc4NkM2LjIzODU4IDEzLjQ3NzIgNCAxOC40NzcyIDQgMjRDNCAyOS41MjI4IDYuMjM4NTggMzQuNTIyOCA5Ljg1Nzg2IDM4LjE0MjFDMTMuNDc3MiA0MS43NjE0IDE4LjQ3NzIgNDQgMjQgNDRaIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDMzODAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjQgMTFDMjUuMzgwNyAxMSAyNi41IDEyLjExOTMgMjYuNSAxMy41QzI2LjUgMTQuODgwNyAyNS4zODA3IDE2IDI0IDE2QzIyLjYxOTMgMTYgMjEuNSAxNC44ODA3IDIxLjUgMTMuNUMyMS41IDEyLjExOTMgMjIuNjE5MyAxMSAyNCAxMVoiIGZpbGw9IiMwMDMzODAiLz48cGF0aCBkPSJNMjQuNSAzNFYyMEgyMy41SDIyLjUiIHN0cm9rZT0iIzAwMzM4MCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjEgMzRIMjgiIHN0cm9rZT0iIzAwMzM4MCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="],

    crosshairB64: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0yNC4wNjA3IDEwTDI0LjAyNCAzOCIgc3Ryb2tlPSIjMDAzMzgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMCAyNEwzOCAyNCIgc3Ryb2tlPSIjMDAzMzgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==",












  },



  onLoad() {
    wx.showLoading({
      title: "数据加载中",
      mask: true,
    });

    this.getScreenSize();
    this.getInfoJson();

    this.setData({
      svgUrl: tcosUrl + "svg/MTR_latest.svg",
      tcosUrl,
    });

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

  getInfoJson() {
    const that = this;
    wx.request({
      url: tcosUrl + "mpVars/mp.json",
      method: "GET",
      success: function (res) {
        mpInfo = res.data;
        that.setData({ mpInfo });
        wx.hideLoading({});
        allowDownload = true;
        that.setData({ msgBox2btnTxt: "下载PDF" });
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






})
