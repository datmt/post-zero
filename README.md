# PostZero

A minimal desktop API client built with Electron and SvelteKit.

## Features

- Send HTTP requests with various methods (GET, POST, PUT, DELETE, etc.)
- Import requests from cURL commands
- Import from Swagger/OpenAPI specifications
- Organize requests in collections
- View formatted responses

## Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev:electron

# Run Electron app with built files
npm run electron
```

## Building for Production

```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

## Releasing New Versions

This project uses GitHub Actions to automatically build and release the app for Windows, macOS, and Linux when a new tag is pushed.

To create a new release:

1. Update the version in `package.json`
2. Commit your changes
3. Create and push a new tag:

```bash
git tag v1.0.0  # Use semantic versioning
git push origin v1.0.0
```

4. GitHub Actions will automatically build the app for all platforms and create a new release with the built artifacts.

## Storage

PostZero stores all data locally using JSON files. By default, data is stored in Electron's `userData` directory, but you can configure a custom location in the Settings panel.

## License

MIT
