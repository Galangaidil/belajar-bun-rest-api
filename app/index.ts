import {Hono} from 'hono'
import {logger} from 'hono/logger'
import users from '../routes/users'

const app = new Hono().basePath('/api');

app.use(logger())

app.get('/', (c) => {
    return c.json({
        message: 'Hello World',
    })
})

app.route('/users', users)

export default app
