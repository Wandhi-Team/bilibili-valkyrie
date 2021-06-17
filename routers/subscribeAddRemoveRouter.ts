/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import { getUnixTime } from "date-fns";
import express from "express";
import getUperInfo from "../api/getUperInfo";
import getUserSpace from "../api/getUserSpace";
import addVideos from "../controllers/addVideos";
import deleteSubscribe from "../controllers/deleteSubscribe";
import Uper from "../models/Uper";

require("express-async-errors");

const subscribeAddRemoveRouter = express.Router();

subscribeAddRemoveRouter.get("/addSubscribe/:mid", async (req, res, next) => {
  const uperInDB = await Uper.findOne({ mid: req.params.mid });
  if (uperInDB !== null) {
    return next({ code: 409, message: `[409] Conflict ${req.params.mid}` });
  }
  const getUperInfoRes = await getUperInfo(req.params.mid);
  const fmtedRes1 = {
    ...getUperInfoRes.data,
    mid: getUperInfoRes.data.card.mid,
    lastUpdate: getUnixTime(Date.now()),
  };
  const newUper = new Uper(fmtedRes1);
  const getUserSpaceRes = await getUserSpace(req.params.mid);
  await newUper.save();
  const dbRes2 = await addVideos(getUserSpaceRes.list.vlist, newUper);
  res.json(dbRes2);
});

subscribeAddRemoveRouter.delete("/delSubscribe/:id", async (req, res) => {
  await deleteSubscribe(req.params.id, res);
  res.status(204).end();
});

export default subscribeAddRemoveRouter;
