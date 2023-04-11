import { ChangeEvent, useState } from 'react';
import { message } from 'antd';
import { observer } from 'mobx-react-lite';
import request from 'service/fetch';
import { useStore } from 'store/index';
import CountDown from 'components/CountDown';
import styles from './index.module.scss';

interface IProps {
  isShow: boolean;
  onClose: Function;
}

const Login = (props: IProps) => {
  const store = useStore();
  const { isShow = false, onClose } = props;
  const [isShowVerifyCode, setIsShowVerifyCode] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    verify: '',
  });

  const handleClose = () => {
    onClose && onClose();
  };

  const handleGetVerifyCode = () => {
    if (!form?.phone) {
      message.warning('your phone');
      return;
    }

    request
      .post('/api/user/sendVerifyCode', {
        to: form?.phone,
        templateId: 1,
      })
      .then((res: any) => {
        if (res?.code === 0) {
          setIsShowVerifyCode(true);
        } else {
          message.error(res?.msg || 'unknown error');
        }
      });
  };

  const handleLogin = () => {
    request
      .post('/api/user/login', {
        ...form,
        identity_type: 'phone',
      })
      .then((res: any) => {
        if (res?.code === 0) {
          // logined
          store.user.setUserInfo(res?.data);
          onClose && onClose();
        } else {
          message.error(res?.msg || 'unknown error');
        }
      });
  };

  // client-id：d26b6141d5ccf60f7ea8
  // client-secret：4003799d14048c0b971eaf1813b3b6ec65f4178e
  const handleOAuthGithub = () => {
    const githubClientid = '4df2f0d03aaefd48178f';
    const redirectUri = 'http://localhost:3000/api/oauth/redirect';
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${githubClientid}&redirect_uri=${redirectUri}`,"_self"
    );
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleCountDownEnd = () => {
    setIsShowVerifyCode(false);
  };

  return isShow ? (
    <div className={styles.loginArea}>
      <div className={styles.loginBox}>
        <div className={styles.loginTitle}>
          <div>phone login</div>
          <div className={styles.close} onClick={handleClose}>
            x
          </div>
        </div>
        <input
          name="phone"
          type="text"
          placeholder="your phone"
          value={form.phone}
          onChange={handleFormChange}
        />
        <div className={styles.verifyCodeArea}>
          <input
            name="verify"
            type="text"
            placeholder="code"
            value={form.verify}
            onChange={handleFormChange}
          />
          <span className={styles.verifyCode} onClick={handleGetVerifyCode}>
            {isShowVerifyCode ? (
              <CountDown time={10} onEnd={handleCountDownEnd} />
            ) : (
              'get code'
            )}
          </span>
        </div>
        <div className={styles.loginBtn} onClick={handleLogin}>
          sign in
        </div>
        <div className={styles.otherLogin} onClick={handleOAuthGithub}>
           Github
        </div>
        <div className={styles.loginPrivacy}>
          login and rester will accept
          <a
            href="https://storyway.win/"
            target="_blank"
            rel="noreferrer"
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  ) : null;
};

export default observer(Login);
