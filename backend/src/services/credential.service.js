import prisma from '../../prisma/client.js';

const credentialService = {
  async getCredentialsByStudent(studentId, userId) {
    // Retrieving universityId from userId
    const user = await prisma.university.findUnique({where: { userId: userId }, select: { id: true }});

    if (!user) {
      throw new Error("University not found for the given user ID.");
    }

    // Retrieval of credentials based on studentId and universityId
    const credentials = await prisma.credential.findMany({
      where: {
        studentId: studentId,
        universityId: user.id,
      },
      // select only the necessary fields
      select: {
        id: true,
        universityId: true,
        degreeName: true,
        program: true,
        canonicalHash: true,
        awardedDate: true,
        revocation: {
          select: {
            revokedAt: true,
            reason: true,
            revokedBy: true,
          },
        },
      },
      orderBy: {
        awardedDate: 'desc',
      },
    });

    if (!credentials || credentials.length === 0) {
      throw new Error("The student has no credentials from the authenticated university or the university does not match the credential issuer")
    }

    return credentials.map((cred) => {
      const { revocation, ...rest } = cred;

      // if no revocation record available, return status active
      if (!revocation) {
        return {
          ...rest,
          revokedAt: null,
          reason: null,
          revokedBy: null,
          status: 'active',
        };
      }

      // if revocation record exists, return status revoked
      return {
        ...rest,
        ...revocation,
        status: 'revoked',
      };
    });
  },
};

export default credentialService;