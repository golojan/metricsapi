// api routes
import { Router, Request, Response } from "express";
import { PostFeedTypes } from "libs/interfaces";
import { dbCon } from "models";
const reactionsRouter = Router();

reactionsRouter.all("/", async (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

reactionsRouter.post("/react", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { postFeedId, fromUser, toUser, comment } = req.body;

  const { PostFeedComments } = await dbCon();

  const created = await PostFeedComments.create({
    postFeedId: postFeedId,
    fromUser: fromUser,
    toUser: toUser,
    comment: comment,
  }).catch(catcher);
  if (created) {
    res.status(200).json({
      status: true,
      data: created,
    });
    return;
  } else {
    res.status(404).json({ status: false, err: "Schools not found" });
    return;
  }
});

reactionsRouter.get(
  "/comments/:commentId/likes",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const commentId = req.params.commentId;
    const { UserReactions } = await dbCon();
    // get all likes for the comment
    const likes = await UserReactions.find({
      commentId: commentId,
      like: true,
      postType: PostFeedTypes.COMMENT,
    }).catch(catcher);
    if (likes) {
      res.status(200).json({
        status: true,
        data: likes,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Error getting likes" });
      return;
    }
  }
);

reactionsRouter.post("/comments/like", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { postFeedId, commentId, fromUser, toUser } = req.body;

  const { UserReactions } = await dbCon();
  // check if the user has already liked the comment and unlike it if true else create a new like for the comment and return it to the user
  const alreadyLiked = await UserReactions.findOne({
    feedType: PostFeedTypes.COMMENT,
    postFeedId: postFeedId,
    commentId: commentId,
    fromUser: fromUser,
    toUser: toUser,
    like: true,
  }).catch(catcher);

  if (alreadyLiked) {
    // if the user has already liked the comment, then unlike it
    const unliked = await UserReactions.findOneAndDelete({
      feedType: PostFeedTypes.COMMENT,
      postFeedId: postFeedId,
      commentId: commentId,
      fromUser: fromUser,
      toUser: toUser,
      like: true,
    }).catch(catcher);

    if (unliked) {
      res.status(200).json({
        status: true,
        like: false,
        data: unliked,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Error unliking comment" });
      return;
    }
  } else {
    // Create new like for the comment
    const created = await UserReactions.create({
      feedType: PostFeedTypes.COMMENT,
      postFeedId: postFeedId,
      commentId: commentId,
      fromUser: fromUser,
      toUser: toUser,
      like: true,
    }).catch(catcher);

    if (created) {
      res.status(200).json({
        status: true,
        like: true,
        data: created,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Error Liking comment" });
      return;
    }
  }
});

reactionsRouter.post("/posts/like", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { postFeedId, fromUser, toUser } = req.body;

  const { UserReactions } = await dbCon();
  // check if the user has already liked the comment and unlike it if true else create a new like for the comment and return it to the user
  const alreadyLiked = await UserReactions.findOne({
    feedType: PostFeedTypes.POST,
    postFeedId: postFeedId,
    fromUser: fromUser,
    toUser: toUser,
    like: true,
  }).catch(catcher);

  if (alreadyLiked) {
    // if the user has already liked the comment, then unlike it
    const unliked = await UserReactions.findOneAndDelete({
      feedType: PostFeedTypes.POST,
      postFeedId: postFeedId,
      fromUser: fromUser,
      toUser: toUser,
      like: true,
    }).catch(catcher);

    if (unliked) {
      res.status(200).json({
        status: true,
        like: false,
        data: unliked,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Error unliking comment" });
      return;
    }
  } else {
    // Create new like for the comment
    const created = await UserReactions.create({
      feedType: PostFeedTypes.POST,
      postFeedId: postFeedId,
      fromUser: fromUser,
      toUser: toUser,
      like: true,
    }).catch(catcher);

    if (created) {
      res.status(200).json({
        status: true,
        like: true,
        data: created,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Error Liking comment" });
      return;
    }
  }
});

reactionsRouter.get(
  "/posts/:postFeedId/likes",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const postFeedId = req.params.postFeedId;
    const { UserReactions } = await dbCon();
    // get all likes for the comment
    const likes = await UserReactions.find({
      postFeedId: postFeedId,
      like: true,
      feedType: PostFeedTypes.POST,
    }).catch(catcher);

    if (likes) {
      res.status(200).json({
        status: true,
        data: likes,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Error getting likes" });
      return;
    }
  }
);

export default reactionsRouter;
