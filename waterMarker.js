class WaterMarker {
  constructor(config = {}) {
    this.config = {}
    this.config.isSetPwd = config.isSetPwd || false // 默认没有配置密码
    // 4 用于存储 是否有密码的 奇数 = 无密码，偶数 = 有密码
    this.config.isSetPwdIndex = 4
    this.config.storeIndexs = [10, 20, 30, 40]
  }
  setIsSetPwd(flag) {
    this.config.isSetPwd = flag
  }
  alert(msg) {
    this.clearFileName()
    alert(msg)
  }
  // 清除 file 选择的 filename
  clearFileName() {
    let domList = document.getElementsByClassName('fileInput')
    for (let i = 0; i < domList.length; i++) {
      let dom = domList[i]
      dom.value = '';
    }
  }
  createCanvas(w, h, text) {
    let dom = document.createElement('canvas')
    dom.width = w
    dom.height = h
    let ctx = dom.getContext('2d')
    if (!w || !h) return this.alert('未获取到 w h')
    if (!text) return this.alert('请写入暗印')
    // NOTE:千万注意：font 与 fillText 的方法不能 换位置，否则效果不佳
    ctx.font = '30px Microsoft Yahei'
    ctx.fillText(`${text}`, 0, 30)
    // document.body.insertBefore(dom, document.getElementById('myText'))
    // document.getElementById('pic').appendChild(dom)
    return { ctx, dom };
  }
  /**
   * 加密
   */
  encipherPic(url, text, pwd = '') {
    if (this.config.isSetPwd && !/^[0-9]*$/.test(pwd)) return this.alert('暂时只支持4位数字')
    var textData, ctx, originalData, dom;
    var img = new Image();
    let self = this
    img.onload = function (e) {
      let resObj = self.createCanvas(img.width, img.height, text)
      ctx = resObj.ctx
      dom = resObj.dom
      textData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
      ctx.drawImage(img, 0, 0);
      originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height); // 256,256
      mergeData(textData, 'R');
      // 成功之后
      document.getElementById('pic').appendChild(dom)
    };
    img.src = url
    var mergeData = function (newData, color) {
      var oData = originalData.data;
      var bit, offset;
      switch (color) {
        case 'R':
          bit = 0;
          offset = 3;
          break;
        case 'G':
          bit = 1;
          offset = 2;
          break;
        case 'B':
          bit = 2;
          offset = 1;
          break;
      }
      for (var i = 0; i < oData.length; i++) {
        if (self.config.isSetPwd && self.config.storeIndexs.indexOf(i) >= 0) {
          let pwd_i = self.config.storeIndexs.indexOf(i)
          // 如果设置了密码
          oData[i] = parseInt(pwd[pwd_i])
          console.log('存入密码', parseInt(pwd[pwd_i]))
        }
        else {
          if (i % 4 == bit) {
            if (newData[i + offset] === 0 && (oData[i] % 2 === 1)) {
              oData[i] = oData[i] === 255 ? oData[i] - 1 : oData[i] + 1;
            }
            else if (newData[i + offset] !== 0 && (oData[i] % 2 === 0)) {
              oData[i] = oData[i] === 255 ? oData[i] - 1 : oData[i] + 1;
            }
          }
        }
      }
      // 有密码 = 偶数
      if (self.config.isSetPwd) {
        let i = 4
        // 如果是奇数，那么就变成偶数
        if (oData[i] % 2 === 1) oData[i] = oData[i] === 255 ? oData[i] - 1 : oData[i] + 1;
      } else {
        let i = 4
        // 无密码 = 奇数
        // 如果是偶数，那么变成 奇数
        if (oData[i] % 2 === 0) oData[i] = oData[i] === 255 ? oData[i] - 1 : oData[i] + 1;
      }
      ctx.putImageData(originalData, 0, 0);
    }
  }
  /**
   * 解密
   */
  decryptPic(url, pwd = '') {
    var ctx, originalData, dom;
    var img = new Image();
    var self = this;
    img.onload = function (e) {
      dom = document.createElement('canvas')
      dom.width = img.width
      dom.height = img.height
      ctx = dom.getContext('2d')
      // document.body.insertBefore(dom, document.getElementById('myText'))

      ctx.drawImage(img, 0, 0);
      originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      // 是否加密
      let num = originalData.data[self.config.isSetPwdIndex]
      if (num % 2 === 0) {
        // 偶数有密码
        if (!/^[0-9]*$/.test(pwd)) return self.alert('暂时只支持4位数字')
        let list = self.config.storeIndexs;
        let pwd_origin = `${originalData.data[list[0]]}${originalData.data[list[1]]}${originalData.data[list[2]]}${originalData.data[list[3]]}`
        if (pwd != pwd_origin) return self.alert('密码不对')
      }
      processData(originalData)
      // 最后都成功才把图片贴出来
      document.getElementById('pic').appendChild(dom)
      self.clearFileName()
    };
    img.src = url;
    var processData = function (originalData) {
      var data = originalData.data;
      for (var i = 0; i < data.length; i++) {
        if (i % 4 === 0) {
          if (data[i] % 2 == 0) {
            data[i] = 0;
            data[i + 1] = 0
            data[i + 2] = 0
            data[i + 3] = 0
          } else {
            data[i] = 0;
            data[i + 1] = 0
            data[i + 2] = 0
            data[i + 3] = 255
          }
        }
      }
      ctx.putImageData(originalData, 0, 0);
    }
  }
}