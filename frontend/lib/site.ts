// Coordonnées de l'agence : numéros provisoires, à remplacer par les vrais
export const SITE = {
  name: "AqarFlow",
  phone: "+92 300 0000000",
  whatsapp: "923000000000", // format international sans le « + »
  email: "hello@aqarflow.example",
  address: "Islamabad, Pakistan",
};

export const telLink = (phone = SITE.phone) => `tel:${phone.replace(/\s/g, "")}`;
export const waLink = (message: string, number = SITE.whatsapp) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;