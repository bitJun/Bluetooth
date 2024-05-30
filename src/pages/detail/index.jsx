import React, { useEffect, useState, useRef } from "react";
import { View, Image, Input } from "@tarojs/components";
import Taro, { useDidHide } from "@tarojs/taro";
import clearIcon from '@images/clearIcon.png';
// import { useSelector } from 'react-redux';
import { set as setGlobalData, get as getGlobalData } from '@config/global';
import {
  ab2hex,
  stringToBuffer,
  hexCharCodeToStr
} from '@utils/util';
import "./index.scss";

const Detail = () => {
  // const device = useSelector((state) => state.device);
  const [focusInfo, setFocusInfo] = useState({
    '1B': false,
    '10': false,
    '11': false,
    '12': false,
    '13': false,
    '23': false,
    '14': false,
    '25': false,
    '24': false,
    '1A': false,
    '17': false,
    '19': false,
    '15': false,
    '1C': false,
    '22': false
  });
  const [companyInfo, setCompanyInfo] = useState({
    '1B': '',
    '10': '',
    '11': '',
    '12': '',
    '13': '',
    '23': '',
    '14': '',
    '25': '',
    '24': '',
    '1A': '',
    '17': '',
    '19': '',
    '15': '',
    '1C': '',
    '22': ''
  });
  const [services, setServices] = useState([]);
  const [readId, setReadId] = useState(null);
  const [writeId, setWriteId] = useState(null);
  const [characteristicsId, setCharacteristicsId] = useState(null);
  const [characteristics, setCharacteristics] = useState([]);

  useEffect(() => {
    onConnectDevice();
  }, []);

  useDidHide(()=>{
    let device = getGlobalData('deviceInfo');
    Taro.closeBLEConnection({
      deviceId: device.deviceId,
    })
  })

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
          success: function(json) {
            setServices(json.services)
            json.services.forEach(item => {
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
    Taro.getBLEDeviceCharacteristics({
      deviceId: device.deviceId,
      serviceId: servicesId,
      success: function(res) {
        setCharacteristicsId(res.characteristics[0].uuid);
        res.characteristics.forEach(item=>{
          if (item.properties.read && item.properties.write) {
            setReadId(servicesId);
            onReadBLECharacteristicValue(servicesId, item.uuid);
          }
          if (item.properties.write && (item.properties.notify || item.properties.indicate)) {
            setWriteId(servicesId);
          }
          if (item.properties.notify || item.properties.indicate) {
            Taro.notifyBLECharacteristicValueChange({
              deviceId: device.deviceId,
              serviceId: servicesId,
              characteristicId: item.uuid,
              state: true,
              success(json) {
                onMonitor();
                // console.log('notifyBLECharacteristicValueChange success', res , res.errMsg)
              },
              fail: function(err) {
                // console.log('readBLECharacteristicValueError:', err);
              }
            })
          }
        })
      }
    });
  }

  const onMonitor = () => {
    Taro.onBLECharacteristicValueChange((res)=>{
      console.log('onMonitor', res);
      console.log('value', ab2hex(res.value))
    })
  }
  
  const onWriteBLECharacteristicValue = () => {
    let device = getGlobalData('deviceInfo');
    let str = 'AA-02-13-02-28-00-0D';
    Taro.writeBLECharacteristicValue({
      deviceId: device.deviceId,
      serviceId: writeId,
      characteristicId: characteristicsId,
      value: stringToBuffer(str),
      // value: buffer,
      complete: function(json) {
        // console.log('json', json)
      }
    })
  }

  const onReadBLECharacteristicValue = (servicesId, characteristicId) => {
    let device = getGlobalData('deviceInfo');
    Taro.readBLECharacteristicValue({
      deviceId: device.deviceId,
      serviceId: servicesId,
      characteristicId: characteristicId,
      success: function(res) {
        console.log('characteristic', res) // 可以获取到特征值的数据
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

  const onSubmit = () => {
    onWriteBLECharacteristicValue();
  }

  return (
    <View>
      <View className='formView'>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            输入欠压限制(0x1B)
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={companyInfo['1B']}
              onInput={(e) => {
                onChangeValue("1B", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输入欠压限制"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['1B'] && focusInfo['1B'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("1B");
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
              value={companyInfo['10']}
              onInput={(e) => {
                onChangeValue("10", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输入过流限制"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['10'] && focusInfo['10'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("10");
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
              value={companyInfo['11']}
              onInput={(e) => {
                onChangeValue("11", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输入过压限制"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['11'] && focusInfo['11'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("11");
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
              value={companyInfo['12']}
              onInput={(e) => {
                onChangeValue("12", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过流限制"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['12'] && focusInfo['12'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("12");
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
              value={companyInfo['13']}
              onInput={(e) => {
                onChangeValue("13", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过压限制"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['13'] && focusInfo['13'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("13");
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
              value={companyInfo['24']}
              onInput={(e) => {
                onChangeValue("23", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过流保护"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['24'] && focusInfo['24'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("23");
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
              value={companyInfo['14']}
              onInput={(e) => {
                onChangeValue("14", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出功率最大值"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['14'] && focusInfo['14'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("14");
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
              value={companyInfo['25']}
              onInput={(e) => {
                onChangeValue("25", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出过压恢复"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['25'] && focusInfo['25'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("25");
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
              value={companyInfo['24']}
              onInput={(e) => {
                onChangeValue("24", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出欠压恢复"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['24'] && focusInfo['24'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("24");
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
              value={companyInfo['1A']}
              onInput={(e) => {
                onChangeValue("1A", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置高温报警限制"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['1A'] && focusInfo['1A'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("1A");
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
              value={companyInfo['17']}
              onInput={(e) => {
                onChangeValue("17", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置周期上报间隔"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['17'] && focusInfo['17'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("17");
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
              value={companyInfo['19']}
              onInput={(e) => {
                onChangeValue("19", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置开启时间段"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['19'] && focusInfo['19'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("19");
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
              value={companyInfo['15']}
              onInput={(e) => {
                onChangeValue("15", e);
              }}
              className='formViewControlInfoValue'
              placeholder="远程开关"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['15'] && focusInfo['15'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("15");
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
              value={companyInfo['1C']}
              onInput={(e) => {
                onChangeValue("1C", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出电压"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['1C'] && focusInfo['1C'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("1C");
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
              value={companyInfo['22']}
              onInput={(e) => {
                onChangeValue("22", e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置输出功率"
              placeholderClass='placeholder'
              maxlength={50}
            />
            {companyInfo['22'] && focusInfo['22'] ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClearValue("22");
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
