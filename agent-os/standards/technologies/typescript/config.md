# TypeScript Configuration Standards

## tsconfig.json Standards

### Compiler Options - Strict Mode (Required)
```json
{
  "compilerOptions": {
    "strict": true,                       // Enable all strict type checking
    "noImplicitAny": true,                // Error on expressions with 'any'
    "strictNullChecks": true,             // Enable strict null checks
    "strictFunctionTypes": true,          // Strict checking of function types
    "strictBindCallApply": true,          // Strict 'bind', 'call', 'apply'
    "noImplicitThis": true,               // Error on 'this' with 'any' type
    "alwaysStrict": true,                 // Parse in strict mode
    "noUnusedLocals": true,               // Report unused locals
    "noUnusedParameters": true,           // Report unused parameters
    "noImplicitReturns": true,            // Report missing returns
    "noFallthroughCasesInSwitch": true   // Report fallthrough cases
  }
}
```

### Module Resolution
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",        // Modern resolution for bundlers
    "esModuleInterop": true,              // Enable interop between ESM and CJS
    "allowSyntheticDefaultImports": true, // Allow default imports
    "resolveJsonModule": true,            // Include JSON modules
    "isolatedModules": true               // Ensure files work in isolation
  }
}
```

### Path Aliases (Required for Clean Imports)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

## Alternative Perspective
**Counter-point**: Strict mode might slow initial development. Some teams prefer starting with partial strict mode and gradually increasing strictness. However, fixing type issues later is often more expensive than doing it right initially.

## Environment-Specific Configs

### Development
- Source maps: `"sourceMap": true`
- Faster builds: `"incremental": true`
- Skip lib check: `"skipLibCheck": true` (dev only)

### Production
- No source maps in production
- Declaration files: `"declaration": true`
- Remove comments: `"removeComments": true`

## Monorepo Configuration
For workspaces, use base config extension:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

## Type Generation
Always generate types for:
- API responses
- Database schemas
- Environment variables
- External libraries without types