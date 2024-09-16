import { getEmailClient } from "./mail";
import { dayjs } from "../../utils/dayjs";
export const sendWelcomeEmail = async (email: string, name: string) => {
  const transporter = await getEmailClient();

  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Boas vindas 🚀",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
    <p>Olá, <strong>${name}</strong>!</p>
    <p></p>
    <p>Estamos felizes em tê-lo(a) a bordo! Agora você pode começar a compartilhar e aproveitar caronas com facilidade e segurança.</p>
    <p></p>
    <p>Qualquer dúvida, estamos aqui para ajudar.</p>
    <p></p>
    <p><strong>Boa viagem!</strong></p>
    <p></p>
    <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
    <br>
    <p>Equipe CaronasApp</p>
  </div>
    `.trim(),
  });
};

export const sendRideCreationEmail = async (
  name: string,
  email: string,
  start_location: string,
  end_location: string,
  start_time: string,
  price: number,
  available_seats: number,
  preferences: string
) => {
  const transporter = await getEmailClient();

  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Nova corrida criada! 🚗",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
    <p>Olá, ${name}!</p>
    <p>Uma nova corrida foi criada com sucesso. Aqui estão os detalhes:</p>
    <p><strong>Local de Partida:</strong> ${start_location}</p>
    <p><strong>Local de Chegada:</strong> ${end_location}</p>
    <p><strong>Data e Hora:</strong> ${dayjs(start_time).format(
      "dddd, MMMM D, YYYY H:mm"
    )}</p>
    <p><strong>Preço:</strong> R$${price.toFixed(2)}</p>
    <p><strong>Assentos Disponíveis:</strong> ${available_seats}</p>
    <p><strong>Preferências:</strong> ${preferences}</p>
    <p></p>
    <p>Se você tiver alguma dúvida ou precisar de mais informações, não hesite em nos contatar.</p>
    <p></p>
    <p>Boa viagem!</p>
    <p></p>
    <p>Equipe CaronasApp</p>
  </div>`.trim(),
  });
};

export const sendRideUpdateNotification = async (
  email: string,
  name: string
) => {
  const transporter = await getEmailClient();
  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Atualização na sua corrida! 🚗",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
    <p>Olá, ${name}!</p>
    <p>Uma corrida que você reservou foi atualizada. Verifique as mudanças na aplicação.</p>
  
    <p>Se você tiver alguma dúvida ou precisar de mais informações, não hesite em nos contatar.</p>
    <p></p>
    <p>Boa viagem!</p>
    <p></p>
    <p>Equipe CaronasApp</p>
  </div>`.trim(),
  });
};

export const sendRideCancellationNotification = async (
  email: string,
  name: string
) => {
  const transporter = await getEmailClient();
  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Corrida cancelada! 🚗",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
  <p>Olá, ${name}!</p>
  <p>Uma corrida que você reservou foi Cancelada.</p>

  <p>Se você tiver alguma dúvida ou precisar de mais informações, não hesite em nos contatar.</p>
  <p></p>
  <p>Boa viagem!</p>
  <p></p>
  <p>Equipe CaronasApp</p>
</div>`.trim(),
  });
};

export const sendAccountReactivationEmail = async (
  email: string,
  name: string
) => {
  const transporter = await getEmailClient();
  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Sua conta foi reativada! 🎉",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
  <p>Olá, ${name}!</p>
  <p>Estamos felizes em informar que sua conta foi reativada com sucesso.</p>
  
  <p>Agora você pode voltar a utilizar todos os nossos serviços. Se você tiver qualquer dúvida ou precisar de assistência, não hesite em nos contatar.</p>
  <p></p>
  <p>Boas viagens!</p>
  <p></p>
  <p>Equipe CaronasApp</p>
</div>`.trim(),
  });
};

export const sendAccountDeactivationEmail = async (
  email: string,
  name: string
) => {
  const transporter = await getEmailClient();
  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Sua conta foi desativada 😢",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
  <p>Olá, ${name}!</p>
  <p>Informamos que sua conta foi desativada.</p>
  
  <p>Se esta desativação foi um engano ou se você tem alguma dúvida sobre o processo, por favor, entre em contato conosco.</p>
  <p></p>
  <p>Atenciosamente,</p>
  <p></p>
  <p>Equipe CaronasApp</p>
</div>`.trim(),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetCode: string
) => {
  const transporter = await getEmailClient();
  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Redefinição de Senha",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
  <p>Olá, ${name}!</p>
  <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para prosseguir com a redefinição:</p>
  <h2 style="font-size: 24px; font-weight: bold; text-align: center;">${resetCode}</h2>
  <p>Este código expirará em 15 minutos.</p>
  <p>Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>
  <p></p>
  <p>Atenciosamente,</p>
  <p>Equipe CaronasApp</p>
</div>`.trim(),
  });
};

export const passwordChangedEmail = async (
  email: string,
  name: string) => {
  const transporter = await getEmailClient();
  await transporter.sendMail({
    from: "integrador@rides.com",
    to: email,
    subject: "Sua senha foi alterada",
    html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
    <p>Olá, ${name}!</p>
    <p>Informamos que sua senha foi alterada recentemente.</p>
    <p>Se você não realizou essa alteração, por favor, entre em contato conosco imediatamente.</p>
    <p></p>
    <p>Atenciosamente,</p>
    <p>Equipe CaronasApp</p>
  </div>`.trim(),
  });
};