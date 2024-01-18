import {Hono} from "hono";
import DB from "../app/services/DB";

const app = new Hono();

app.get('/', async (c) => {
  const posts = await DB.post.findMany()
  return c.json({
    items: posts,
  })
})

app.get('/:id', async (c) => {
  const post = await DB.post.findUnique({
    where: {
      id: Number(c.req.param('id')),
    },
  })

  return c.json({
    item: post,
  })
})


export default app