import React, { useEffect, useState, useRef } from "react";
import { View, Image, Input, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
// import { NavBar } from "@components";
import Logo from '@images/logo.png';
import clearIcon from '@images/clearIcon.png';
import hideIcon from '@images/hide.png';
import showIcon from '@images/show.png';
import { setStorageSync } from "@utils/util";
import {
  postMiniLogin
} from '@api';
import "./index.scss";

const Login = () => {
  let [systemInfo, setSystemInfo] = useState({});
  let [rate, setRate] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [accountParams, setAccountParams] = useState({
    username: '',
    password: ''
  });
  const [focusInfo, setFocusInfo] = useState({
    username: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    if (accountParams.username && accountParams.password) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [accountParams]);

  useEffect(() => {
    getSystemInfo();
  }, []);

  const getSystemInfo = () => {
    Taro.getSystemInfoAsync({
      success(res) {
        setSystemInfo(res);
        setRate(res.safeArea.width / 750);
      },
    });
  };

  const onChange = (type, event) => {
    let value = event.detail.value;
    let data = { ...accountParams };
    data[type] = value;
    setAccountParams(data);
  };

  const onClear = (key) => {
    let data = { ...accountParams };
    data[key] = "";
    setAccountParams(data);
  };

  const onLogin = () => {
    if (!accountParams.username) {
      Taro.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }
    if (!accountParams.password) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    else {
      postMiniLogin(accountParams)
        .then(res=>{
          console.log('res', res);
          setStorageSync('accessToken', res.token);
          setStorageSync('userInfo', res.userInfo);
          Taro.redirectTo({
            url: '/pages/index/index'
          })
        })
        .catch(err=>{
          console.log('err',err)
        })
    }
  };

  const onShowPwd = (event) => {
    event.stopPropagation();
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  };

  const onFocus = (key) => {
    let data = { ...focusInfo };
    data[key] = true;
    setFocusInfo(data);
  };

  const onBlur = (key) => {
    let data = { ...focusInfo };
    data[key] = false;
    setFocusInfo(data);
  };

  const forgetPwd = () => {
    Taro.navigateTo({
      url: '/pages/resetPwd/index'
    });
  }

  return (
    <>
      <View className="bgMask"></View>
      <View
        style={{
          width: "100%",
          left: 0,
          position: "absolute",
          top: `calc(${systemInfo?.safeArea?.top}px + ${88 * rate}px)`,
          zIndex: 9,
        }}
      >
        <View className="loginView">
          <Image
            src={Logo}
            className="loginViewLogo"
            mode="aspectFit"
            lazyLoad={true}
          />
          {/* <View className="loginViewTitle">欢迎</View> */}
          <View className="loginViewMain">
            <View className="loginViewForm">
              <View className="loginViewFormControl">
                <Input
                  value={accountParams.username}
                  placeholder="请输入用户名"
                  placeholderClass="placeholder"
                  className={`${
                    accountParams.username
                      ? "loginViewFormControlValue"
                      : "loginViewFormControlNoValue"
                  }`}
                  onInput={(e) => {
                    onChange("username", e);
                  }}
                  cursor={accountParams.username.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("username");
                  }}
                  onBlur={() => {
                    onBlur("username");
                  }}
                />
                {accountParams.username && focusInfo.username ? (
                  <View
                    className="loginViewFormControlAction"
                    onClick={() => {
                      onClear("username");
                    }}
                  >
                    <Image
                      src={clearIcon}
                      className="loginViewFormControlActionImg"
                      mode="widthFix"
                      lazyLoad={true}
                    />
                  </View>
                ) : null}
              </View>
              <View className="loginViewFormControl loginViewFormControlPass">
                <Input
                  className="loginViewFormControlValue"
                  value={accountParams.password}
                  placeholder="请输入密码"
                  placeholderClass="placeholder"
                  password={showPassword}
                  onInput={(e) => {
                    onChange("password", e);
                  }}
                  cursor={accountParams.password.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("password");
                  }}
                  onBlur={() => {
                    onBlur("password");
                  }}
                />
                {accountParams.password && focusInfo.password ? (
                  <View
                    className="loginViewFormControlClear"
                    onClick={(e) => {
                      onClear("password", e);
                    }}
                  >
                    <Image
                      src={clearIcon}
                      className="loginViewFormControlClearIcon"
                      mode="widthFix"
                    />
                  </View>
                ) : null}
                <View
                  className="loginViewFormControlAction"
                  onClick={(e) => {
                    onShowPwd(e);
                  }}
                >
                  <Image
                    src={showPassword ? hideIcon : showIcon}
                    className="loginViewFormControlActionImg w48"
                    mode="widthFix"
                    lazyLoad={true}
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="loginViewFormTip">
            <Text
              className="loginViewFormTipAction"
              onClick={() => {
                forgetPwd();
              }}
            >
              忘记密码
            </Text>
          </View>
          <View
            className={`loginViewFormAction ${
              canSubmit ? 'active' : ""
            }`}
            onClick={() => {
              onLogin();
            }}
          >
            登 录
          </View>
        </View>
      </View>
    </>
  );
};

export default Login;
