#!/usr/bin/env node

// Copyright 2017 Luca-SAS, licensed under the Apache License 2.0

const parquet = require('../index.js');
const _ = require('underscore');

const argv = require('minimist')(process.argv.slice(2), {
  string: '_',
  boolean: [
    'h', 'help',
    'V', 'version',
    'o', 'headeroff'
  ],
  default: {}
});

const help = 'Usage: parquet [options] <command> [<args>]\n' +
  '\n' +
  'Command line tool to manipulate parquet files\n' +
  '\n' +
  'Commands:\n' +
  '  cat file               Print file content on standard output\n' +
  '  head file              Print the first lines of file\n' +
  '  info file              Print file metadata\n' +
  '  tsv,csv,psv file       Print file content with delimited output\n' +
  '\n' +
  'Options:\n' +
  '  -h,--help              Print this help text\n' +
  '  -V,--version           Print version and exits\n' +
  '  -o,--headeroff         Print file content without header\n';

if (argv.h || argv.help) {
  process.stdout.write(help);
  process.exit();
}
if (argv.V || argv.version) {
  var pkg = require('../package');
  process.stdout.write(pkg.name + '-' + pkg.version);
  process.exit();
}

switch (argv._[0]) {
  case 'cat':
    cat(argv._[1]);
    break;
  case 'tsv':
    xsv(argv._[1], '\t');
    break;
  case 'psv':
    xsv(argv._[1], '|');
    break;
  case 'csv':
    xsv(argv._[1], ',');
    break;
  case 'head':
    cat(argv._[1], 5);
    break;
  case 'info':
    info(argv._[1]);
    break;
  default:
    die('Error: invalid command: ' + argv._[0]);
}

function cat(file, max) {
  const reader = new parquet.ParquetReader(file);
  const info = reader.info();
  const n = max < info.rows ? max : info.rows;
  for (var i = 0; i < n; i++) {
    data = reader.rows(1);
    process.stdout.write(JSON.stringify(data[0]) + '\n');
  }
}

function xsv(file, delimitor, max) {
  const reader = new parquet.ParquetReader(file);
  const info = reader.info();
  const n = max < info.rows ? max : info.rows;
  if (!(argv.o || argv.headeroff)) {
    process.stdout.write(JSON.stringify(_.keys(reader.info().schema)).replace(/^\[|\]/g,'').replace(/,/g,delimitor) + '\n');
  }
  for (var i = 0; i < n; i++) {
    data = reader.rows(1);
    process.stdout.write(
	((delimitor === ',') ? JSON.stringify(data[0]).replace(/^\[|\]/g,'') : JSON.stringify(data[0]).replace(/^\[|\]/g,'').replace(/,/g,delimitor).replace(/"/g,'')) + '\n'
    );
  }
}

function die(err) {
  console.error(err);
  process.exit(1);
}

function info(file) {
  const reader = new parquet.ParquetReader(file);
  process.stdout.write(JSON.stringify(reader.info(), null, 2) + '\n');
}
