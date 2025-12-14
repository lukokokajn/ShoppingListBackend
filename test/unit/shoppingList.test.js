const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connect, disconnect, mongoose } = require("../../src/db/mongo");
const app = require("../../src/app");

// Modely pro čistění DB
const ShoppingList = require("../../src/models/shoppingList");
const Membership = require("../../src/models/membership");

function headers(profile = "User", identity = "test-user-1") {
    return {
        "X-User-Profile": profile,
        "X-User-Identity": identity,
        "Content-Type": "application/json"
    };
}

describe("ShoppingList uuCmd tests", () => {
    let mongo;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await connect(mongo.getUri());
    });

    afterAll(async () => {
        await disconnect();
        if (mongo) await mongo.stop();
    });

    beforeEach(async () => {
        // vyčisti DB před každým testem
        await ShoppingList.deleteMany({});
        await Membership.deleteMany({});
    });

    // ---------------------------------------
    // CREATE: shoppingList/create
    // ---------------------------------------
    test("shoppingList/create - happy day", async () => {
        const res = await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ title: "Nákup", description: "Test" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe("Nákup");
        expect(res.body.uuAppErrorMap).toBeDefined();

        // ověř i membership (owner) vytvořený v DB
        const membership = await Membership.findOne({ userId: "userA" }).lean();
        expect(membership).toBeTruthy();
        expect(membership.role).toBe("owner");
    });

    test("shoppingList/create - alternative: invalid dtoIn", async () => {
        const res = await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ description: "chybí title" });

        expect(res.status).toBe(400);
        expect(res.body.uuAppErrorMap).toHaveProperty("shoppingListCreate/invalidDtoIn");
    });

    // ---------------------------------------
    // GET: shoppingList/get
    // ---------------------------------------
    test("shoppingList/get - happy day", async () => {
        // připrav data
        const created = await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ title: "Seznam", description: "" });

        const listId = created.body.id;

        const res = await request(app)
            .get(`/shoppingList/get?id=${listId}`)
            .set(headers("User", "userA"));

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(listId);
        expect(res.body.title).toBe("Seznam");
    });

    test("shoppingList/get - alternative: does not exist", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .get(`/shoppingList/get?id=${fakeId}`)
            .set(headers("User", "userA"));

        expect(res.status).toBe(404);
        expect(res.body.uuAppErrorMap).toHaveProperty("shoppingListGet/listDoesNotExist");
    });

    // ---------------------------------------
    // LIST: shoppingList/listMy
    // ---------------------------------------
    test("shoppingList/listMy - happy day", async () => {
        await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ title: "A", description: "" });

        await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ title: "B", description: "" });

        const res = await request(app)
            .get("/shoppingList/listMy?pageIndex=0&pageSize=50")
            .set(headers("User", "userA"));

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.itemList)).toBe(true);
        expect(res.body.itemList.length).toBe(2);
        expect(res.body.pageInfo.total).toBe(2);
    });

    test("shoppingList/listMy - alternative: invalid paging", async () => {
        const res = await request(app)
            .get("/shoppingList/listMy?pageIndex=-1&pageSize=5000")
            .set(headers("User", "userA"));

        expect(res.status).toBe(400);
        expect(res.body.uuAppErrorMap).toHaveProperty("shoppingListListMy/invalidDtoIn");
    });

    // ---------------------------------------
    // UPDATE: shoppingList/update
    // ---------------------------------------
    test("shoppingList/update - happy day", async () => {
        const created = await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ title: "Old", description: "" });

        const listId = created.body.id;

        const res = await request(app)
            .post("/shoppingList/update")
            .set(headers("User", "userA"))
            .send({ id: listId, title: "New" });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(listId);
        expect(res.body.title).toBe("New");
    });

    test("shoppingList/update - alternative: unauthorized (not owner)", async () => {
        const created = await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "ownerUser"))
            .send({ title: "Owner list", description: "" });

        const listId = created.body.id;

        const res = await request(app)
            .post("/shoppingList/update")
            .set(headers("User", "otherUser"))
            .send({ id: listId, title: "Hack" });

        expect(res.status).toBe(403);
        expect(res.body.uuAppErrorMap).toHaveProperty("system/unauthorized");
    });

    // ---------------------------------------
    // DELETE: shoppingList/delete
    // ---------------------------------------
    test("shoppingList/delete - happy day", async () => {
        const created = await request(app)
            .post("/shoppingList/create")
            .set(headers("User", "userA"))
            .send({ title: "To delete", description: "" });

        const listId = created.body.id;

        const res = await request(app)
            .post("/shoppingList/delete")
            .set(headers("User", "userA"))
            .send({ id: listId });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(listId);

        // ověř, že už neexistuje
        const list = await ShoppingList.findById(listId).lean();
        expect(list).toBeNull();
    });

    test("shoppingList/delete - alternative: does not exist", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/shoppingList/delete")
            .set(headers("User", "userA"))
            .send({ id: fakeId });

        expect(res.status).toBe(404);
        expect(res.body.uuAppErrorMap).toHaveProperty("shoppingListDelete/listDoesNotExist");
    });
});
