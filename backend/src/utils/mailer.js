export async function sendInviteEmail(email, token) {
  const link = `https://applicationName.com/university/activate?token=${token}`
  console.log(`Invite sent to ${email}`)
  console.log(`Activation link: ${link}`)
}