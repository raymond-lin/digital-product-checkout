import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION_SES });
const FROM_NAME = process.env.FROM_NAME;
const FROM_EMAIL = process.env.FROM_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function sendEmailNotification(toEmail, programName, downloadLink) {
  const subject = `Payment Confirmation – ${programName}`;
  let checksums = {};

  switch (programName) {
    case 'Email & Text Hash Generator Pro 1.0':
      checksums = {
        crc32: '7BA0F00C',
        crc64: '4847B4E93130C37C',
        md5: 'F4D1F8D3030AD0648FE5509395100417',
        sha1: 'BD8C1AF0C2042ED389C0A73DBDBF99DD513B2BE2',
        sha256: 'F4B8C099D968D78F91CC1360F4AE2105AB4DA21D0CA61E5EC34B3033A7173D08',
        sha384: '24CBB5027D61052632E7636C4408CF2A7405A60FA9ED8EF726229F0CEA3381EB01FD1954B1713FC683C90AB73217A2C2',
        sha512: '0EDA4051C3954D0158FE93A9822D6A7CD733C6E8A658AF3B3F9F41A9F120C50B45912919A71F29067AF690F800718A719378D61FFDFE19EED38218B23FCDA618',
        sha3_256: 'F84A79CCF816B221B9FF556AAAAF8CA676FC16E3E68AFCC4694204747C1BF253',
        sha3_512: '2EE6B7CA415CF70B2F07641A2C259E320C9501A5C5AD305D583E3EAA7A63BDFEDFB02DD40BC02E0D83312DD431DDA8468E96AA741D445DEDA56F71CAB007F022',
        blake2b: 'B79A64318AB66A3A9E71F79835482D0DDD0AB31B9CE7D1FBA96B1D65D5E5A5051AF2D0FCCB525A711DEAF7461BF18C080AC4665290AC172B4EF3F9BCCC7E624C',
        blake2s: 'CAB19597A2F74C719795BF45F4F7CC72C48BE0DEFB947E68C2E7DBA1D5935C89',
        blake3: 'E635443FF3D3D9A47FFF1370709A6F449DDBBA46191D0D0C5F30A6B738980C5F',
      };
      break;
    case 'MD5 & SHA Checksum Utility Pro 2.1':
      checksums = {
        crc32: '2BB8251C',
        crc64: 'F24DD971253828C6',
        md5: '7FBC510980FBC4C2925371EE9BD26C96',
        sha1: 'F5E41A2B5EEB29879514334E18F74E2056AEBC88',
        sha256: '11F2D9DE92A923813C769B1EA40D5165172F202FA7CFAD2881CD24E9322D51DF',
        sha384: '6DA7698808F943E0734DBF23B44B4396A88B17F7B9F2376C30A61CFBEC25AD6E86B9CEBACB7882CA502CAA300576CCA3',
        sha512: 'D4838E8227461C67DF54AB403E0367BD53B7151C6CBD951AB285B76330B40069FB86F10C55142BB095186018BCAD1BFF178AF88F4437DE0324A51E1D18964E32',
        sha3_256: 'A96EE72F035DF6E5FFD5863ECB4BA25B06F906E1D03BD4E481384C58F6BFDC6E',
        sha3_512: 'ED5721BD80710F0072C2005878596C5AE1BF9EC15B4D8BB43A2E6690E64E74745924F6F7AD13C5929D972E50D6DC8595CFC10F99DCE49D5DE3BD0934F28337D4',
        blake2b: '735457551322212A33590FC38FB3952964FD5E99D72EA6744A21E42AB158E871E0B1D14FB16E9C7A0F68CCFB7377DA5210005DA7010B4F48BE6CCB211DE4811C',
        blake2s: 'A652E7929D3C54DC3D1A853AB068189ED42482203C9FB84D3D0CAC16581B57D8',
        blake3: 'B015AABA81C6C071195934B6DF1614A684A67D0ECA8EF2DBC637DB1CC353A04B',
      };
      break;
    case 'MD5 & SHA Checksum Utility Pro 3.0':
    case 'MD5 & SHA Checksum Utility Pro 3.0 (Existing Customer Upgrade)':
      checksums = {
        crc32: '38E0493F',
        crc64: 'B1900B7CE3A8C8C8',
        md5: '3CB3335220A478F70C465BAD11A14272',
        sha1: '407C22EF7CA316777B579F9EA5B6E60944C2843F',
        sha256: '9B0CD4BD662509B39C69692870A717E8AD63E8A541A99B60854DE4053082C5FB',
        sha384: '0B9C33AADCD8DED57658EC5AD582F7A65CD0928EA49455976D9417B84F711E204A6F377C92601205EC562F5574A72B82',
        sha512: 'BC2984FD0AC1DE1AC6CCF40C011C623C82DDFBBA9F2769EC85D6D02E5474F64E9F5E3DD13C8C2E1703A49B42CCD9EA70CC3B17612C408522DA07C2E75277EE84',
        sha3_256: '683262FD1B28DFE28D246EDD70D8BA130630503F202A3335C32057AE85F850A8',
        sha3_512: 'FF21318C21F815DA0B5AF8742427170C7A200AAFBE0D6271F0832306A3DF557DF538C4EA7A708893F32C4443BE0B9C86C124633750DA17D39E17BE6691BF03D0',
        blake2b: '6F00C3AAD5009F0D4F4B31FA26A15388725B930F11A516C8E7314271DCB4907EFFA3651D891479BCC3C343AA7B70117498D8D3D976F66258E94F37EB8882A304',
        blake2s: 'C49790666E89B17EE19F74F7F20ACD649A4F319EF97D4BF49DF36C4DFEBD2D9C',
        blake3: '08D0E723B6D6A2B762DD7C6D20669454BF30D745ABDA46A34F964C9EB137C607',
      };
      break;
    default:
      checksums = {};
      break;
  }

  const bodyHtml = `
  <html>
    <body>
      <h1>Thank you for your purchase of ${programName}!</h1>
      <p>Your file is ready for download. Please note that the link will expire in 30 minutes. Click below to download:</p>
      <p><a href="${downloadLink}">Download Your Product</a></p>
      <hr />
      <p><strong>Checksums:</strong></p>
      <ul>
        <li><strong>CRC32 Checksum:</strong> ${checksums.crc32}</li>
        <li><strong>CRC64 Checksum:</strong> ${checksums.crc64}</li>
        <li><strong>MD5 Checksum:</strong> ${checksums.md5}</li>
        <li><strong>SHA-1 Checksum:</strong> ${checksums.sha1}</li>
        <li><strong>SHA-256 Checksum:</strong> ${checksums.sha256}</li>
        <li><strong>SHA-384 Checksum:</strong> ${checksums.sha384}</li>
        <li><strong>SHA-512 Checksum:</strong> ${checksums.sha512}</li>
        <li><strong>SHA3-256 Checksum:</strong> ${checksums.sha3_256}</li>
        <li><strong>SHA3-512 Checksum:</strong> ${checksums.sha3_512}</li>
        <li><strong>BLAKE2B Checksum:</strong> ${checksums.blake2b}</li>
        <li><strong>BLAKE2S Checksum:</strong> ${checksums.blake2s}</li>
        <li><strong>BLAKE3 Checksum:</strong> ${checksums.blake3}</li>
      </ul>
      <p>Generated by MD5 & SHA Checksum Utility @ <a href="https://raylin.wordpress.com/downloads/md5-sha-1-checksum-utility">https://raylin.wordpress.com/downloads/md5-sha-1-checksum-utility</a></p>
    </body>
  </html>`;

  // Plain text version of the email with checksums
  const bodyText = `
  Thank you for your purchase of ${programName}.
  Your file is ready for download. Please note that the link will expire in 30 minutes. Click below to download:

  Download Your Product: ${downloadLink}

  Checksums:
  CRC32 Checksum: ${checksums.crc32}
  CRC64 Checksum: ${checksums.crc64}
  MD5 Checksum: ${checksums.md5}
  SHA-1 Checksum: ${checksums.sha1}
  SHA-256 Checksum: ${checksums.sha256}
  SHA-384 Checksum: ${checksums.sha384}
  SHA-512 Checksum: ${checksums.sha512}
  SHA3-256 Checksum: ${checksums.sha3_256}
  SHA3-512 Checksum: ${checksums.sha3_512}
  BLAKE2B Checksum: ${checksums.blake2b}
  BLAKE2S Checksum: ${checksums.blake2s}
  BLAKE3 Checksum: ${checksums.blake3}

  Generated by MD5 & SHA Checksum Utility @ https://raylin.wordpress.com/downloads/md5-sha-1-checksum-utility
  `;
  const params = {
    Source: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [toEmail],
      BccAddresses: [ADMIN_EMAIL],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: {
          Data: bodyText,
        },
        Html: {
          Data: bodyHtml,
        },
      },
    },
    ReplyToAddresses: [ADMIN_EMAIL],
  };

  await sesClient.send(new SendEmailCommand(params));
}
