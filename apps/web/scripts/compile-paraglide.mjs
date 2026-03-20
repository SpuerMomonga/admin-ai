import { compile } from '@inlang/paraglide-js'
import { getParaglideOptions } from '../paraglide.config.js'

await compile(getParaglideOptions(process.env.NODE_ENV === 'development' ? 'development' : 'production'))
