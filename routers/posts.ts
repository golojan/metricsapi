// api routes
import { Router, Request, Response } from "express";
import { dbCon } from "models";
const postsRouter = Router();

postsRouter.all("/", async (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

postsRouter.post(
  "/comments/add-comment",
  async (req: Request, res: Response) => {
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
  }
);

postsRouter.get(
  "/comments/:postFeedId/all",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const postFeedId = req.params.postFeedId;
    const { PostFeedComments } = await dbCon();
    const comments = await PostFeedComments.find({
      postFeedId: postFeedId,
    })
      .sort({ createdAt: -1 })
      .catch(catcher);
    if (comments) {
      res.status(200).json({
        status: true,
        comments: comments,
      });
      return;
    } else {
      res.status(404).json({ status: false, err: "Schools not found" });
      return;
    }
  }
);

export default postsRouter;
