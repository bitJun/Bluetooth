import React, { useEffect, useState, useRef } from "react";
import { View, Image, Input, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
// import { NavBar } from "@components";
import Logo from '@images/logo.png';
import clearIcon from '@images/clearIcon.png';
import hideIcon from '@images/hide.png';
import showIcon from '@images/show.png';
import {
  postMiniLogin
} from '@api';
import "./index.scss";

const Login = () => {
  let [systemInfo, setSystemInfo] = useState({});
  let [rate, setRate] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [agree, setAgree] = useState(false);
  const [accountParams, setAccountParams] = useState({
    account: "",
    password: "",
    uuid: "",
    source: 2,
    code: "",
    identity: 2,
  });
  const [focusInfo, setFocusInfo] = useState({
    account: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    if (accountParams.account && accountParams.password) {
      console.log(1)
      setCanSubmit(true);
    } else {
      console.log(2)
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

  const onAgree = () => {
    setAgree(!agree);
  };

  const onClear = (key) => {
    let data = { ...accountParams };
    data[key] = "";
    setAccountParams(data);
  };

  const onLogin = () => {
  };

  const forgetPwd = () => {
    Taro.navigateTo({
      url: "/pages/subpages/forgetPwd/index",
    });
  };

  const onRegister = () => {
    Taro.redirectTo({
      url: "/pages/subpages/register/index",
    });
  };

  const onLoginByCode = () => {
    Taro.navigateTo({
      url: "/pages/subpages/loginByCode/index",
    });
  };

  const onShowPwd = (event) => {
    event.stopPropagation();
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  };

  const onShowProtocol = (url, event) => {
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

  return (
    <>
      {/* <NavBar title="" showBack={true} bgColor="transparent" color="#333333" /> */}
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
                  value={accountParams.account}
                  placeholder="请输入用户名/手机号"
                  placeholderClass="placeholder"
                  className={`${
                    accountParams.account
                      ? "loginViewFormControlValue"
                      : "loginViewFormControlNoValue"
                  }`}
                  onInput={(e) => {
                    onChange("account", e);
                  }}
                  cursor={accountParams.account.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("account");
                  }}
                  onBlur={() => {
                    onBlur("account");
                  }}
                />
                {accountParams.account && focusInfo.account ? (
                  <View
                    className="loginViewFormControlAction"
                    onClick={() => {
                      onClear("account");
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
          {/* <View className="loginViewFormForget">
            <Text
              className="loginViewFormForgetText"
              onClick={() => {
                forgetPwd();
              }}
            >
              忘记密码
            </Text>
          </View> */}
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
          {/* <View className="loginViewFormTip">
            <View
              onClick={() => {
                onLoginByCode();
              }}
            >
              手机验证码登录
            </View>
            <View>
              还没账号？去
              <Text
                className="loginViewFormTipAction"
                onClick={() => {
                  onRegister();
                }}
              >
                注册
              </Text>
            </View>
          </View> */}
          {/* <View
            className="loginViewProtocol"
            onClick={() => {
              onAgree();
            }}
          >
            <Image
              src={
                agree
                  ? `${baseUrl}common/checked.png`
                  : `${baseUrl}common/uncheck.png`
              }
              className="loginViewProtocolIcon"
              lazyLoad={true}
            />
            已阅读并同意
            <Text
              className="loginViewProtocolTip"
              onClick={(e) => {
                onShowProtocol('https://h5-dev.mall.xiuzheng.com/user', e);
              }}
            >
              服务协议、
            </Text>
            <Text
              className="loginViewProtocolTip"
              onClick={(e) => {
                onShowProtocol('https://h5-dev.mall.xiuzheng.com/privacy', e);
              }}
            >
              隐私协议
            </Text>
          </View> */}
        </View>
      </View>
    </>
  );
};

export default Login;
