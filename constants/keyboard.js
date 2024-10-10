const { InlineKeyboard, Keyboard } = require("grammy");
const { faqKeyboardData } = require("./faq");
const { Menu } = require("@grammyjs/menu");

const inlineKeyboardsCommands = {
  notFinished: {
    yes: "sendConversation",
    no: "stopConversation",
  },
  submit: {
    yes: "application submitted",
    no: "editing an application",
  },
};

const submitKeyboard = new InlineKeyboard()
  .text("Да", inlineKeyboardsCommands.submit.yes)
  .text("Редактировать", inlineKeyboardsCommands.submit.no);

const notFinishedKeyboard = new InlineKeyboard()
  .text("Да", inlineKeyboardsCommands.notFinished.yes)
  .text("Нет", inlineKeyboardsCommands.notFinished.no);

const commands = [
  { command: "/start", description: "Запустить бота" },
  { command: "/help", description: "Помощь" },
  { command: "/zakaz", description: "Заказать услугу" },
];

const menuButton = {
  zakaz: "Заказать услугу",
  // faq: "FAQ",
};

// Создаём клавиатуру
const buttonRows = Object.values(menuButton).map((label) => [
  Keyboard.text(label),
]);
const keyboard = Keyboard.from(buttonRows).resized();

const inlineAdminKeyboard = new InlineKeyboard().text("Связался", "contacted");

const faqInlineMenu = new Menu("faq-menu");
Object.keys(faqKeyboardData).forEach((key) => {
  faqInlineMenu
    .text(faqKeyboardData[key]["question"], (ctx) =>
      ctx.reply(
        `<b>${faqKeyboardData[key]["question"]}</b>\n\n${faqKeyboardData[key]["answer"]}`,
        {
          reply_markup: faqInlineMenu,
          parse_mode: "HTML",
        }
      )
    )
    .row();
});

module.exports = {
  commands,
  keyboard,
  menuButton,
  faqInlineMenu,
  submitKeyboard,
  inlineAdminKeyboard,
  notFinishedKeyboard,
  inlineKeyboardsCommands,
};
