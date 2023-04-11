import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input, Button, message } from 'antd';
import request from 'service/fetch';
import styles from './index.module.scss';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4 },
};

const UserProfile = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    request.get('/api/user/detail').then((res: any) => {
      if (res?.code === 0) {
        console.log(333333);
        console.log(res?.data?.userInfo);
        form.setFieldsValue(res?.data?.userInfo);
      }
    });
  }, [form]);

  const handleSubmit = (values: any) => {
    console.log(99999);
    console.log(values);
    request.post('/api/user/update', { ...values }).then((res: any) => {
      if (res?.code === 0) {
        message.success('修改成功');
      } else {
        message.error(res?.msg || '修改失败');
      }
    });
  };

  return (
    <div className="content-layout">
      <div className={styles.userProfile}>
        <h2>personal information</h2>
        <div>
          <Form
            {...layout}
            form={form}
            className={styles.form}
            onFinish={handleSubmit}
          >
            <Form.Item label="Name" name="nickname">
              <Input placeholder="Your name" />
            </Form.Item>
            <Form.Item label="Position" name="job">
              <Input placeholder="Your job" />
            </Form.Item>
            <Form.Item label="Introduce" name="introduce">
              <Input placeholder="Introduce yourself" />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);
