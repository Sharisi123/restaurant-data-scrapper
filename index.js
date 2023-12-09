const puppeteer = require("puppeteer");
const fs = require("fs/promises");
// const { Pool } = require('pg');

const main = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL, change URL for other menus
  await page.goto(
    "https://expz.menu/372562a9-d13e-40a7-9224-d3079bf42ccf/menu?menuId=2394"
  );

  await page.setViewport({ width: 1920, height: 1024 });

  await page.waitForSelector(".dish-list");
  const cardSelected = await page.$$(".dish-list");
  const cards = await Promise.all(
    cardSelected.map((item) =>
      item.evaluate((dishList) => {
        const dishType = dishList.children.item(0)?.textContent;
        const dishesParsed = [...dishList.children].slice(1).map((dish) => {
          const title = dish.querySelector(".item-title")?.textContent;
          const price = +dish
            .querySelector(".price")
            ?.textContent.replace(" ₴", "");
          const amount = dish.querySelector(".item-amount")?.textContent;
          const description =
            dish.querySelector(".item-description")?.textContent ?? null;
          const image = dish.querySelector("img")?.src ?? null;

          return {
            type: "АЛКОГОЛЬ",
            subType: dishType,
            title,
            price,
            amount,
            description,
            image,
          };
        });

        return dishesParsed;
      })
    )
  );

  const data = cards
    .reduce((acc, cards) => [...acc, ...cards], [])
    .reduce((acc, card) => {
      return (
        acc +
        `${card.price},"${card.title}",${card.amount},"${card.image}","${card.description}","${card.type}","${card.subType}"\n`
      );
    }, "");
  // console.log('data', data);
  fs.writeFile("./current.csv", `${data}`);

  await browser.close();
};

main();
