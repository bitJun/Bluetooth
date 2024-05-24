import React, { useEffect, useState, useRef } from "react";
import { View, Image, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import clearIcon from '@images/clearIcon.png';
// import { useSelector } from 'react-redux';
import { set as setGlobalData, get as getGlobalData } from '@config/global';
import {
  ab2hex
} from '@utils/util';
import "./index.scss";

const Detail = () => {
  // const device = useSelector((state) => state.device);
  const [focusInfo, setFocusInfo] = useState({});
  const [companyInfo, setCompanyInfo] = useState({});
  const [services, setServices] = useState([]);
  const [readId, setReadId] = useState(null);
  const [writeId, setWriteId] = useState(null);
  const [characteristics, setCharacteristics] = useState([]);

  useEffect(() => {
    onConnectDevice();
    // initService();
  }, []);

  useEffect(()=>{
    console.log('services', services)
    // if (services && services.length > 0) {
    //   onLoadDeviceCharacteristics();
    // }
  }, [services]);

  const InArray = (arr, key, val) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) {
            return i;
        }
    }
    return -1;
  }

  const onConnectDevice = () => {
    let device = getGlobalData('deviceInfo');
    Taro.createBLEConnection({
      deviceId: device.deviceId,
      success: function(res) {
        Taro.getBLEDeviceServices({
          deviceId: device.deviceId,
          success: function(res) {
            setServices(res.services)
            console.log('services', res.services)
            res.services.forEach(item => {
              onLoadDeviceCharacteristics(item.uuid)
            })
          }
        })
      }
    })
  }

  const onLoadDeviceCharacteristics = (servicesId) => {
    let device = getGlobalData('deviceInfo');
    // 获取特征值
    wx.getBLEDeviceCharacteristics({
      deviceId: device.deviceId,
      serviceId: servicesId,
      success: function(res) {
        console.log('characteristics', res)
        res.characteristics.forEach(item=>{
          if (item.properties.read) {
            setReadId(item.uuid);
            onReadBLECharacteristicValue(servicesId, item.uuid);
          }
          if (item.properties.write) {
            setWriteId(item.uuid);
          }
          if (item.properties.notify || item.properties.indicate) {
            console.log('item.properties', item.properties)
            Taro.notifyBLECharacteristicValueChange({
              deviceId: device.deviceId,
              serviceId: servicesId,
              characteristicId: item.uuid,
              state: true,
              success(res) {
                console.log('notifyBLECharacteristicValueChange success', res , res.errMsg)
                // if (item.properties.read) {
                //   onReadBLECharacteristicValue(servicesId, item.uuid);
                // }
              },
              fail: function(err) {
                console.log('readBLECharacteristicValueError:', err);
              }
            })
          }
        })
      }
    })
    wx.onBLECharacteristicValueChange((characteristic) => {
      console.log('characteristic11',characteristic,ab2hex(characteristic.value))
      console.log(`characteristic ${characteristic.characteristicId} has changed, now is ${ab2hex(characteristic.value)}`)
      //开锁
      // if (characteristic.value.byteLength == 4) {
      //     // 以下这行我把开门密钥写死了 "0102030405060708" ，没有从全局变量读
      //     var buff = OpenLock(characteristic.value, this.data.lockname, "0102030405060708" /*this.data.devices[0].auth.productKey*/)
      //     onWriteBLECharacteristicValue(buff)
      // }
      // const idx = InArray(this.data.chs, 'uuid', characteristic.characteristicId)
      // const data = {}
      // if (idx === -1) {
      //     data[`chs[${this.data.chs.length}]`] = {
      //         uuid: characteristic.characteristicId,
      //         value: ab2hex(characteristic.value)
      //     }
      // } else {
      //     data[`chs[${idx}]`] = {
      //         uuid: characteristic.characteristicId,
      //         value: ab2hex(characteristic.value)
      //     }
      // }
      // var chr=ab2hex(characteristic.value);
      // if(chr.substring(chr.length - 2, chr.length)=="5a"){
      //     // 断开蓝牙连接
      //     this_page.CloseBLEConnection()
      // }
      // this.setData(data)
    })
  }

  const onWriteBLECharacteristicValue = (strArray) => {
    const array = new Uint8Array(strArray.length)
    strArray.forEach((item, index) => array[index] = item)
    Taro.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: array.buffer,
    })
  }

  const onReadBLECharacteristicValue = (servicesId, characteristicId) => {
    console.log('servicesId', servicesId);
    console.log('characteristicId', characteristicId);
    let device = getGlobalData('deviceInfo');
    Taro.readBLECharacteristicValue({
      deviceId: device.deviceId,
      serviceId: servicesId,
      characteristicId: characteristicId,
      success: function(res) {
        console.log('characteristic', res) // 可以获取到特征值的数据
      },
      fail: function (err) {
        console.log('err', err)
      }
    })
  }

  const onChangeValue = (type, e) => {
    let value = e.target.value;
    let data = {...companyInfo};
    data[type] = value;
    setCompanyInfo(data);
  };

  const onClearValue = (type) => {
    let data = {...companyInfo};
    data[type] = '';
    setCompanyInfo(data);
  }

  const onBlur = (key) => {
    let data = { ...focusInfo };
    data[key] = false;
    setFocusInfo(data);
  };

  return (
    <View>
      <View className='formView'>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输入欠压限制(0x1B)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输入欠压限制"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输入过流限制(0x10)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输入过流限制"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输入过压限制(0x11)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输入过压限制"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输出过流限制(0x12)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过流限制"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输出过压限制(0x13)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过压限制"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输出过流保护(0x23)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过流保护"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输出功率最大值(0x14)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出功率最大值"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输出过压恢复(0x25)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过压恢复"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输出欠压恢复(0x24)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出欠压恢复"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            高温报警限制(0x1A)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置高温报警限制"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            周期上报间隔(0x17)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置周期上报间隔"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            开启时间段(0x19)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置开启时间段"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            远程开关(0x15)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="远程开关"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            设置输出电压(0x1C)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出电压"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            设置输出功率(0x22)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo.name}
              onInput={(e) => {
                onChangeValue("name", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出功率"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={() => {
                onFocus("name");
              }}
              onBlur={() => {
                onBlur("name");
              }}
            />
            {companyInfo.name && focusInfo.name ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("name");
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className='formViewLine'></View>
      </View>
      <View className='DetailViewFooter'>
        <View
          className='DetailViewFooterAction'
          onClick={() => {
            onSubmit();
          }}
        >
          确认修改
        </View>
      </View>
    </View>
  );
};

export default Detail;
