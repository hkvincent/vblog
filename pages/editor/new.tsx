import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useStore } from 'store/index';
import request from 'service/fetch';
import styles from './index.module.scss';
// import { set } from 'date-fns';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const NewEditor = () => {
  const store = useStore();
  const router = useRouter();
  const { push } = router;
  const { userId } = store.user.userInfo;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [allTags, setAllTags] = useState([]);



  useEffect(() => {
    request.get('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        setAllTags(res?.data?.allTags || [])
      }
    })
  }, []);

  const handlePublish = () => {
    if (!title) {
      message.warning('请输入文章标题');
      return;
    }
    request.post('/api/article/publish', {
      title,
      content,
      tagIds
    }).then((res: any) => {
      if (res?.code === 0) {
        userId ? push(`/user/${userId}`) : push('/');
        message.success('发布成功');
      } else {
        message.error(res?.msg || '发布失败');
      }
    })
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };

  const handleContentChange = (content: any) => {
    setContent(content);
  };

  const handleSelectTag = (value: []) => {
    setTagIds(value);
  }

  const handleBack = () => {
    router.back();
  }


  return (
    <div className={styles.container}>
      <div className={styles.operation}>
        <Button
          className={styles.button}
          type="primary"
          onClick={handleBack}
        >
          Back
        </Button>
        <Input
          className={styles.title}
          placeholder="Title"
          value={title}
          onChange={handleTitleChange}
        />
        <Select
          className={styles.tag}
          mode="tags"
          allowClear
          placeholder="Tags"
          onChange={handleSelectTag}
          //options={allTags}
        >
          {allTags?.map((tag: any) => (
            <Select.Option key={tag?.id} value={tag?.title}>{tag?.title}</Select.Option>
          ))}
        </Select>
        <Button
          className={styles.button}
          type="primary"
          onClick={handlePublish}
        >
          Publish
        </Button>
      </div>
      <MDEditor value={content} height={1080} onChange={handleContentChange} />
    </div>
  );
};

(NewEditor as any).layout = null;

export default observer(NewEditor);
