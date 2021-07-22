import IconDatabase from './IconDatabase';

const db = new IconDatabase();

db.transaction('rw', db.icons, async () => {
  // Make sure we have something in DB:
  if ((await db.icons.toCollection().count()) < 2) {
    const id = await db.icons.add({ name: 'Josephine', age: 21 });
    alert(`Addded friend with id ${id}`);
  }

  // Query:
  //   const youngFriends = await db.icons
  //     .where('age')
  //     .below(25)
  //     .toArray();

  const youngFriends = await db.icons.toCollection().last();

  // Show result:
  console.log('My young friends: ' + JSON.stringify(youngFriends));
}).catch(e => {
  console.error(e.stack || e);
});

console.log(db);

export default db;
