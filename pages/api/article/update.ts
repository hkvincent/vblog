import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article, Tag } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

export default withIronSessionApiRoute(update, ironOptions);

async function update(req: NextApiRequest, res: NextApiResponse) {
  const { title = '', content = '', id = 0, tagIds = [] } = req.body;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const tagRepo = db.getRepository(Tag);
  var tags: Tag[] = [];
  if (tagIds.length > 0) {
    tags = await tagRepo.find({
      where: tagIds?.map((tagId: number) => ({ title: tagId })),
    });
  }


  const article = await articleRepo.findOne({
    where: {
      id,
    },
    relations: ['user', 'tags'],
  });

  const needAddTag = tags?.filter((e) => {
    return article?.tags.every((articleTag) => articleTag.title !== e.title)
  })

  const existTag = tags?.filter((e) => {
    return article?.tags.some((articleTag) => articleTag.title === e.title)
  })

  const willRemoveTag = article?.tags.filter((e) => {
    return tags.every((articleTag) => articleTag.title !== e.title)
  })

  willRemoveTag?.map((tag) => {
    tag.article_count = tag.article_count - 1;
    tag.save();
  })

  const newTags = needAddTag?.map((tag) => {
    tag.article_count = tag.article_count + 1;
    return tag;
  });

  newTags.push(...existTag);

  if (tags.length !== tagIds.length) {
    const commonElements: string[] = tagIds?.filter((tagId: string) =>
      (tags.every((tag) => tag.title !== tagId))
    )

    commonElements.map((e: string) => {
      const tag = new Tag();
      tag.article_count = 1
      tag.title = e
      tag.follow_count = 0
      tag.icon = "TagOutlined"
      newTags.push(tag)
    })

  }

  if (article) {
    article.title = title;
    article.content = content;
    article.update_time = new Date();
    article.tags = newTags;

    const resArticle = await articleRepo.save(article);

    if (resArticle) {
      res.status(200).json({ data: resArticle, code: 0, msg: '更新成功' });
    } else {
      res.status(200).json({ ...EXCEPTION_ARTICLE.UPDATE_FAILED });
    }
  } else {
    res.status(200).json({ ...EXCEPTION_ARTICLE.NOT_FOUND });
  }
}
