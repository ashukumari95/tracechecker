export const identifyInput = (input: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?(\d{1,3})?[- .]?\(?(?:\d{2,3})\)?[- .]?\d\d\d[- .]?\d\d\d\d$/;
  const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+)\.[a-z]{2,}/;

  if (emailRegex.test(input)) return { type: 'EMAIL', value: input };
  if (phoneRegex.test(input)) return { type: 'PHONE', value: input.replace(/\D/g, '') }; // Clean phone number
  if (urlRegex.test(input)) return { type: 'SOCIAL_LINK', value: input };
  
  return { type: 'USERNAME', value: input.replace('@', '') };
};