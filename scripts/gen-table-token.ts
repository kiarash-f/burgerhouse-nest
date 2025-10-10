// scripts/gen-table-token.ts
import 'dotenv/config';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TableTokenService } from '../src/dinein/table-token.service';

async function run() {
  // Accept: npm run gen:tt -- 5  OR  npm run gen:tt -- --table=5  OR  TABLE_ID=5 npm run gen:tt
  const flag = process.argv.find((a) => a.startsWith('--table=')) || '';
  const fromFlag = flag ? Number(flag.split('=')[1]) : NaN;
  const fromPositional = Number(process.argv[2]);
  const fromEnv = Number(process.env.TABLE_ID);
  const tableId = [fromFlag, fromPositional, fromEnv].find(
    (n) => Number.isInteger(n) && n > 0,
  );

  if (!tableId) {
    console.error('❌ Missing table id.');
    console.error('   Usage: npm run gen:tt -- 5');
    console.error('      or: npm run gen:tt -- --table=5');
    console.error('      or: TABLE_ID=5 npm run gen:tt');
    process.exit(1);
  }

  console.log('⏳ Booting Nest application context...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const svc = app.get(TableTokenService);
    const token = svc.sign(tableId);
    console.log(`\n✅ Table ${tableId} token:\n${token}\n`);
    console.log(
      '👉 Use it in your QR as: https://your-frontend.com/menu?tt=<token>',
    );
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error('❌ Failed to generate token:', err);
  process.exit(1);
});
