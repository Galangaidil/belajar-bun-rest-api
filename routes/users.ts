import {Hono} from "hono";
import DB from "../app/services/DB";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";

const app = new Hono();

// Define a schema for the request body
const userSchema = z.object({
    name: z.string().min(3).max(255),
    email: z.string().email(),
})

// Create a new user
app.post(
    "/new",
    zValidator("json", userSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
            }, 422)
        }
    }),
    async (c) => {
        const body = c.req.valid("json")

        // check if email already exists
        const userExists = await DB.user.findFirst({
            where: {
                email: body.email
            }
        })

        if (userExists) {
            return c.json({
                message: "Email already been taken",
            }, 422)
        }

        const user = await DB.user.create({
            data: {
                name: body.name,
                email: body.email,
            }
        })

        return c.json({
            message: "User created",
            item: user
        }, 201)
    })

// Get all users
app.get("/", async (c) => {
    const users = await DB.user.findMany({
        orderBy: {
            id: "desc"
        }
    })

    return c.json({
        items: users
    })
})

// Get a single user by id
app.get("/:id", async (c) => {
    const id = c.req.param('id')

    const user = await DB.user.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!user) {
        return c.json({
            message: "User not found",
        }, 404)
    }

    return c.json({
        item: user
    })
})

// Update a user by id
app.put("/:id",
    zValidator("json", userSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
            }, 422)
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        const body = c.req.valid("json")

        const user = await DB.user.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!user) {
            return c.json({
                message: "User not found",
            }, 404)
        }

        // check if email already exists for another user
        const emailExists = await DB.user.findFirst({
            where: {
                email: body.email,
                id: {
                    not: parseInt(id)
                }
            }
        })

        if (emailExists) {
            return c.json({
                message: "Email already been taken",
            }, 422)
        }

        const updatedUser = await DB.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name: body.name,
                email: body.email,
            }
        })

        return c.json({
            message: "User updated",
            item: updatedUser
        })
    })

// Delete a user by id
app.delete("/:id", async (c) => {
    const id = c.req.param('id')

    const user = await DB.user.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!user) {
        return c.json({
            message: "User not found",
        }, 404)
    }

    await DB.user.delete({
        where: {
            id: parseInt(id)
        }
    })

    return c.json({
        message: "User deleted",
    })
})

export default app