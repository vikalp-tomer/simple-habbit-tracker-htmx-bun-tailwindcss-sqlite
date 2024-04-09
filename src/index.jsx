import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { Database } from "bun:sqlite";
import { migrate, getMigrations } from "bun-sqlite-migrations";

const db = new Database(":memory:");
migrate(db, getMigrations("./migrations"));

const listAllHabits = (db) => {
  return db.query("select * from habits order by id desc").all();
};

const deleteHabitById = (db, id) => {
  db.query("delete from habits where id = $id").run({ $id: id });
};

const HabitComponent = ({ habit }) => {
  return (
    <div id={`habit-${habit.id}`}>
      <div class={"border border-gray-700 mb-5 p-5 rounded-md"}>
        <h1 class={"font-bold"}>{habit.title}</h1>
        <p class={"text-sm text-gray-500"}>{habit.description}</p>

        {/* add history of habit */}

        {/* add buttons to delete and edit */}
        <div class={"flex gap-1 text-sm mt-5"}>
          <button class={"hover:text-sky-700"}>Edit</button>
          {/* <span>*</span> */}
          <button
            class={"hover:text-red-700"}
            hx-delete={`/habits/${habit.id}`}
            hx-confirm={"Are you sure?"}
            hx-target={`#habit-${habit.id}`}
            hx-swap={"outerHTML"}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AddHabitButtonComponent = () => {
  return (
    <button
      class={
        "w-full rounded-md bg-gray-800 hover:bg-gray-700 p-5 font-bold mb-5"
      }
    >
      Add Habbit
    </button>
  );
};

const HabitsPage = () => {
  const habits = listAllHabits(db);
  return (
    <section class={"bg-gray-900 text-white"}>
      <div class={"mx-auto max-w-screen-xl px-4 py-10"}>
        <h1
          class={
            "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl mb-10"
          }
        >
          Simple Habit Tracker
        </h1>

        {/* add button to create new habbit */}
        <AddHabitButtonComponent />

        {/* list of habits */}
        {habits.map((habit) => (
          <HabitComponent habit={habit} />
        ))}
      </div>
    </section>
  );
};
const rootHandler = () => {
  return (
    <html>
      <head>
        <title>Habits Tracker</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          src="https://unpkg.com/htmx.org@1.9.11"
          integrity="sha384-0gxUXCCR8yv9FM2b+U3FDbsKthCI66oH5IA9fHppQq9DDMHuMauqq1ZHBpJxQ0J0"
          crossorigin="anonymous"
        ></script>
      </head>
      <body>
        <HabitsPage />
      </body>
    </html>
  );
};

const app = new Elysia()
  .use(html())
  .get("/", rootHandler)
  .delete("/habits/:id", ({ params }) => {
    console.log(`Deleting habit ${params.id}`);
    deleteHabitById(db, params.id);
    return null;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
