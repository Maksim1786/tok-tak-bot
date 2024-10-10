const { InlineKeyboard } = require("grammy");
const submitText = "application submitted";
const editText = "editing an application";
const keyboard = new InlineKeyboard()
  .text("Да", submitText)
  .text("Редактировать", editText);

async function jobApplication(conversation, ctx) {
  await ctx.reply(
    "Поделитесь с нами вашим номером телефона и мы вам перезвоним\n❗Вводите только цифры❗"
  );

  let phoneNumber = await conversation.form.int(async (number) => {
    if (!Number.isInteger(number.msg.text)) {
      await ctx.reply("Вводите только цифры");
    }
  });

  if (!`${phoneNumber}`.startsWith("+")) {
    const phoneNumberStr = `${phoneNumber}`;
    const firstNumber = `+${Number(phoneNumberStr.slice(0, 1)) - 1}`;

    phoneNumber = `${firstNumber}${phoneNumberStr.slice(1)}`;
  }

  conversation.session.phone = phoneNumber;
  await ctx.reply("Прекрасно! Как вас зовут?");
  const userName = await conversation.form.text();
  conversation.session.name = userName;
  await ctx.reply(
    `Ваши данные:\n<b>Имя:</b> ${conversation.session.name}\n<b>Телефон:</b> ${conversation.session.phone}\nВсё верно?`,
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    }
  );
  const { match } = await conversation.waitForCallbackQuery(
    [submitText, editText],
    {
      otherwise: (ctx) =>
        ctx.reply("Используйте кнопки!", { reply_markup: keyboard }),
    }
  );

  if (match === editText) {
    return jobApplication(conversation, ctx);
  }
  return;
}

module.exports = {
  submitText,
  jobApplication,
};
