const {
  submitKeyboard,
  notFinishedKeyboard,
  inlineKeyboardsCommands,
} = require("../constants/keyboard");

async function jobApplication(conversation, ctx) {
  await ctx.reply(
    "Поделитесь с нами вашим номером телефона и мы вам перезвоним\n❗Вводите только цифры❗"
  );

  const phoneNumber = await conversation.form.text();

  let cleanNumber = phoneNumber.replaceAll(new RegExp(/[-|(|)|\s]/g), "");

  if (!Number.isInteger(Number(cleanNumber))) {
    await ctx.reply("Вводите только цифры");
    return jobApplication(conversation, ctx);
  }
  if (!/^\+?\d{11}$/.test(cleanNumber)) {
    await ctx.reply("Номер телефона должен иметь только 11 цифр");
    return jobApplication(conversation, ctx);
  }

  if (!cleanNumber.startsWith("+")) {
    const firstNumber = `+${Number(cleanNumber.slice(0, 1)) - 1}`;
    cleanNumber = `${firstNumber}${cleanNumber.slice(1)}`;
  }

  conversation.session.phone = cleanNumber;
  await ctx.reply("Прекрасно! Как вас зовут?");
  const userName = await conversation.form.text();
  conversation.session.name = userName;
  await ctx.reply(
    `Ваши данные:\n<b>Имя:</b> ${userName}\n<b>Телефон:</b> ${phoneNumber}\nВсё верно?`,
    {
      parse_mode: "HTML",
      reply_markup: submitKeyboard,
    }
  );
  const { match } = await conversation.waitForCallbackQuery(
    [inlineKeyboardsCommands.submit.yes, inlineKeyboardsCommands.submit.yes],
    {
      otherwise: (ctx) =>
        ctx.reply("Вы заполнили, но не отправили заявку. Отправить?", {
          reply_markup: notFinishedKeyboard,
        }),
    }
  );

  if (match === editText) {
    return jobApplication(conversation, ctx);
  }
  return;
}

module.exports = {
  jobApplication,
};
