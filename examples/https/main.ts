import { camelCase } from 'https://deno.land/x/case@2.1.1/mod.ts';
import { logLocal } from './local.ts';

logLocal();
console.log(camelCase('Hello world in camel case!'));
