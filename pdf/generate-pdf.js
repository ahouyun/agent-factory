#!/usr/bin/env node

/**
 * Agent Factory PDF 生成脚本
 *
 * 使用方法：
 * 1. 安装依赖：npm install -g md-to-pdf
 * 2. 运行脚本：node pdf/generate-pdf.js
 *
 * 或者使用 npx：
 * npx md-to-pdf docs/week0/day1.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 需要生成 PDF 的文件列表
const files = [
  'docs/week0/day1.md',
  'docs/week0/day5.md',
  'docs/week1/day1.md',
  'docs/week1/day3.md',
  'docs/week4/day2.md',
  'docs/week5/day1.md',
  'docs/week6/day1.md',
  'docs/week8/day1.md',
];

// PDF 输出目录
const outputDir = 'pdf';

console.log('📚 Agent Factory PDF 生成工具\n');

// 检查 md-to-pdf 是否安装
try {
  execSync('md-to-pdf --version', { stdio: 'ignore' });
  console.log('✅ md-to-pdf 已安装\n');
} catch (error) {
  console.log('❌ md-to-pdf 未安装');
  console.log('请运行：npm install -g md-to-pdf\n');
  process.exit(1);
}

// 生成 PDF
let successCount = 0;
let failCount = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  跳过 ${file}（文件不存在）`);
    failCount++;
    continue;
  }

  const outputFile = path.join(outputDir, path.basename(file, '.md') + '.pdf');

  try {
    console.log(`📄 生成 ${file} → ${outputFile}`);
    execSync(`md-to-pdf ${file} --output ${outputFile}`, { stdio: 'ignore' });
    console.log(`   ✅ 成功\n`);
    successCount++;
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
    failCount++;
  }
}

console.log(`\n📊 结果：成功 ${successCount} 个，失败 ${failCount} 个`);
console.log(`📁 PDF 文件保存在 ${outputDir}/ 目录`);
