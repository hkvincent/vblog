import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, useState, useEffect } from 'react';
import { Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity';
import request from 'service/fetch';
import styles from './index.module.scss';
import { IArticle } from 'pages/api';

interface IProps {
  article: IArticle
}

export async function getServerSideProps({ params }: any) {
  const articleId = params?.id;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const article = await articleRepo.findOne({
    where: {
      id: articleId,
    },
    relations: ['user', 'tags'],
  });

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const ModifyEditor = ({ article }: IProps) => {
  const router = useRouter();
  const { push, query } = router;
  const articleId = Number(query?.id)
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  // const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags.map(tag => tag.title) || []);
  const [tagIds, setTagIds] = useState<string[]>(article?.tags.map(tag => tag.title) || []);
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
      message.warning('Title');
      return;
    }
    request.post('/api/article/update', {
      id: articleId,
      title,
      content,
      tagIds
    }).then((res: any) => {
      if (res?.code === 0) {
        articleId ? push(`/article/${articleId}`) : push('/');
        message.success('update success');
      } else {
        message.error(res?.msg || 'update fail');
      }
    })
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };

  const handleContentChange = (content: any) => {
    setContent(content);
  };

  const handleSelectTag = (value: string[]) => {
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
          placeholder="Ttile"
          value={title}
          onChange={handleTitleChange}
        />
        <Select<string[]>
          className={styles.tag}
          mode="tags"
          allowClear
          placeholder="Tags"
          defaultValue={[...tagIds]}
          onChange={handleSelectTag}

        >{allTags?.map((tag: any) => (
          <Select.Option key={tag?.id} value={tag?.title}>{tag?.title}</Select.Option>
        ))}</Select>
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

(ModifyEditor as any).layout = null;

export default observer(ModifyEditor);
