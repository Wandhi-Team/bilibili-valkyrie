import getUnixTime from "date-fns/getUnixTime";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app";
import wait from "../utils/wait";
import initDB from "./helper/testdb_init";

const api = supertest(app);

describe("Subscribe update test", () => {
  test("can mark subscribe as read", async () => {
    const uperInDB = await initDB();
    const res = await api.get(`/api/getStatus/${uperInDB._id}`);
    const firstUpdate = res.body.lastUpdate;
    await wait(1000);
    const res2 = await api.put(`/api/subU/markSubscribeRead/${uperInDB._id}`);
    const secondUpdate = res2.body.lastUpdate;
    expect(firstUpdate === secondUpdate).toBe(false);
  });
  test("can set subscribe's lastUpdate time", async () => {
    const uperInDB = await initDB();
    const res = await api.get(`/api/getStatus/${uperInDB._id}`);
    const firstUpdate = res.body.lastUpdate;
    await wait(1000);
    const now = Date.now();
    const res2 = await api
      .put(`/api/subU/changeSubscribeReadTime/${uperInDB._id}`)
      .send({ lastUpdateJS: now });
    const secondUpdate = res2.body.lastUpdate;
    expect(secondUpdate).toBe(getUnixTime(now));
    expect(firstUpdate === secondUpdate).toBeFalsy();
  });
  test("can get updated videos", async () => {
    const uperInDB = await initDB();
    const res1 = await api.get(`/api/subU/getUpdate/${uperInDB._id}`);
    expect(res1.body).toStrictEqual([]);
    const res2 = await api.get(`/api/getStatus/${uperInDB._id}`);
    const lastUpdateUnix = res2.body.videos[1].created;
    await api
      .put(`/api/subU/changeSubscribeReadTime/${uperInDB._id}`)
      .send({ lastUpdateUnix });
    const res3 = await api.get(`/api/subU/getUpdate/${uperInDB._id}`);
    expect(res3.body.length).toBe(2);
  });
});

afterAll(async () => {
  mongoose.connection.close();
});