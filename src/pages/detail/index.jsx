import React, { useEffect, useState, useRef } from "react";
import { View, Image, Input } from "@tarojs/components";
import Taro, { useDidHide, useRouter } from "@tarojs/taro";
import clearIcon from '@images/clearIcon.png';
import editIcon from '@images/edit.png';
import useSyncState from '@utils/hooks';
import {
  ab2hex,
  stringToBuffer,
  splitStringByTwoStrict
} from '@utils/util';
import {
  Overlay
} from '@nutui/nutui-react-taro';
import "./index.scss";

const Detail = () => {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(null);
  const [id, setId] = useState('TTE0101DT2405000001');
  const [focused, setFocused] = useState(false);
  const [bluetoothInfo, setBluetoothInfo] = useSyncState({});
  const info = useRef({
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
  })
  const [writeId, setWriteId] = useState(null);
  const [characteristicsId, setCharacteristicsId] = useState(null);
  const read = useRef(null);
  const characteristic = useRef(null);
  const [visible1, setVisible1] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [characterId, setCharacterId] = useState(null);

  useEffect(() => {
    let params = router.params;
    if (params.deviceId) {
      setDeviceId(params.deviceId)
    }
  }, []);

  useEffect(()=>{
    if (deviceId) {
      onConnectDevice();
    }
  }, [deviceId]);

  useDidHide(()=>{
    Taro.closeBLEConnection({
      deviceId: deviceId,
    })
  })

  const onConnectDevice = () => {
    Taro.createBLEConnection({
      deviceId: deviceId,
      success: function(res) {
        Taro.getBLEDeviceServices({
          deviceId: deviceId,
          success: function(json) {
            onLoadDeviceCharacteristics(json.services[0].uuid)
          }
        })
      }
    })
  }

  const onLoadDeviceCharacteristics = (servicesId) => {
    setWriteId(servicesId);
    read.current = servicesId;
    // 获取特征值
    Taro.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: servicesId,
      success: function(res) {
        setCharacteristicsId(res.characteristics[0].uuid);
        characteristic.current = res.characteristics[0].uuid
        res.characteristics.forEach(item=>{
          if (item.properties.write) {
            setWriteId(servicesId);
          }
          if (item.properties.notify) {
            onReadBLECharacteristicValue();
            Taro.notifyBLECharacteristicValueChange({
              deviceId: deviceId,
              serviceId: servicesId,
              characteristicId: item.uuid,
              state: true,
              success(json) {
                onMonitor();
              },
              fail: function(err) {
              }
            })
          }
        })
      }
    });
  }

  /**
   * 监听低功耗蓝牙设备的特征值变化
   */
  const onMonitor = () => {
    Taro.onBLECharacteristicValueChange((res)=>{
      let arr = splitStringByTwoStrict(ab2hex(res.value).toLocaleUpperCase());
      let key = arr[1];
      let value = parseInt(arr[3], 16);
      let val = {...info.current};
      val[key] = value;
      info.current = val;
      // console.log('info.current', info.current)
      setBluetoothInfo(val)
      console.log('bluetoothInfo', bluetoothInfo)
    })
  }
  
  /**
   * BLE写入数据
   */
  const onWriteBLECharacteristicValue = () => {
    // let str = 'AA-02-13-02-28-00-0D';
    let str = `AA-02-${characterId}-02-${value}-00-0D`;
    Taro.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: writeId,
      characteristicId: characteristicsId,
      value: stringToBuffer(str),
      complete: function(json) {
        setVisible1(false);
      }
    })
  }

  const onReadBLECharacteristicValue = () => {
    let keys = Object.keys(info.current);
    for(var i = 0; i < keys.length; i++) {
      (function(n){  //利用闭包
        setTimeout(function(){
          let str = `AA-01-${keys[n]}-0D`;
          console.log('str', str);
          console.log('keys', keys[n]);
          Taro.writeBLECharacteristicValue({
            deviceId: deviceId,
            serviceId: read.current,
            characteristicId: characteristic.current,
            value: stringToBuffer(str),
            complete: function(json) {
              // console.log('read', json)
            }
          })
        }, 1000*n)
      })(i)
    }
  }

  const onChange = (event) => {
    let value = event.target.value;
    setId(value);
  }

  const onClear = () => {
    setId('');
  }

  const onEdit = (key, val) => {
    let data = info.current[key];
    setCharacterId(key);
    setValue(data);
    setTitle(val);
    setVisible1(true);
  }

  const onChangeInfo = (event) => {
    setValue(event.target.value)
  }

  const onHandleSubmit = () => {
    Taro.showToast({
      title: `characterId:${characterId};;value:${value}`,
      icon: 'none'
    });
    onWriteBLECharacteristicValue();
  }

  const onCancel = () => {
    setTitle('');
    setValue('');
    setVisible1(false);
  }

  return (
    <View>
      <View className='formView'>
        <View className='formViewControl'>
          <View className='formViewControlLabel'>
            设备Id
          </View>
          <View className='formViewControlInfo'>
            <Input
              value={id}
              onInput={(e) => {
                onChange(e);
              }}
              className='formViewControlInfoValue'
              placeholder="请设置设备Id"
              placeholderClass='placeholder'
              maxlength={50}
              onFocus={()=>{setFocused(true)}}
              onBlur={()=>{setFocused(false)}}
            />
            {id && focused ? (
              <View className='formViewControlInfoAction'>
                <Image
                  src={clearIcon}
                  className='formViewControlInfoActionIcon'
                  mode="widthFix"
                  onClick={() => {
                    onClear();
                  }}
                  lazyLoad={true}
                />
              </View>
            ) : null}
          </View>
        </View>
        {
          id && id == 'TTE0101DT2405000001' ? (
            <>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输入欠压限制(0x1B)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['1B'] ? bluetoothInfo['1B'] : '请设置输入欠压限制'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('1B', '输入欠压限制')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输入过流限制(0x10)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['10'] != '' ? bluetoothInfo['10'] : '请设置输入过流限制'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('10', '输入过流限制')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输入过压限制(0x11)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['11'] ? bluetoothInfo['11'] : '请设置输入过压限制'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('11', '输入过压限制')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输出过流限制(0x12)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['12'] ? bluetoothInfo['12'] : '请设置输出过流限制'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('12', '输出过流限制')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输出过压限制(0x13)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['13'] ? bluetoothInfo['13'] : '请设置输出过压限制'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('13', '输出过压限制')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输出过流保护(0x23)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['23'] ? bluetoothInfo['23'] : '请设置输出过流保护'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('23', '输出过流保护')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输出功率最大值(0x14)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['14'] ? bluetoothInfo['14'] : '请设置输出功率最大值'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('14', '输出功率最大值')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输出过压恢复(0x25)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['25'] ? bluetoothInfo['25'] : '请设置输出过压恢复'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('25', '输出过压恢复')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  输出欠压恢复(0x24)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['24'] ? bluetoothInfo['24'] : '请设置输出欠压恢复'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('24', '输出欠压恢复')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  高温报警限制(0x1A)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['1A'] ? bluetoothInfo['1A'] : '请设置高温报警限制'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('1A', '高温报警限制')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  周期上报间隔(0x17)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['17'] ? bluetoothInfo['17'] : '请设置周期上报间隔'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('17', '周期上报间隔')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  开启时间段(0x19)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['19'] ? bluetoothInfo['19'] : '请设置开启时间段'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('19', '开启时间段')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  远程开关(0x15)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['15'] ? bluetoothInfo['15'] : '远程开关'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('15', '远程开关')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  设置输出电压(0x1C)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['1C'] ? bluetoothInfo['1C'] : '请设置输出电压'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('1C', '设置输出电压')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
              <View className='formViewControl'>
                <View className='formViewControlLabel'>
                  设置输出功率(0x22)
                </View>
                <View className='formViewControlInfo'>
                  <View className="formViewControlInfoValue">
                    {bluetoothInfo['22'] ? bluetoothInfo['22'] : '请设置输出功率'}
                  </View>
                  <Image
                    src={editIcon}
                    className='edit'
                    onClick={()=>{onEdit('22', '设置输出功率')}}
                  />
                </View>
              </View>
              <View className='formViewLine'></View>
            </>
          ) : null
        }
      </View>
      <Overlay
        visible={visible1}
        onClick={() => {
          // onClose(false);
        }}
        style={{
          backgroundColor: "rgba(0, 0, 0, .5)",
          "--nutui-overlay-zIndex": 2000,
        }}
      >
        <View className='modal'>
          <View className="modal-title">{title}</View>
          <View className="modal-Info">
            <Input
              value={value}
              onChange={(e)=>{onChangeInfo(e)}}
              className="modal-Value"
              cursor={value.toString().length}
            />
            {
              value &&
              <View className="clearAction" onClick={()=>{setValue('')}}>
                <Image
                  src={clearIcon}
                  className="clearActionIcon"
                />
              </View>
            }
          </View>
          <View className="modal-footer">
            <View className="cancel" onClick={()=>{onCancel()}}>取消</View>
            <View className="sure" onClick={()=>{onHandleSubmit()}}>确认</View>
          </View>
        </View>
      </Overlay>
    </View>
  );
};

export default Detail;
