# What is UI Developer Nerdvana?

UI Developer Nerdvana is when your *code*-*build*-*test* cycle can be shortened to
*save*-*refresh*. From *minutes* to *seconds*. Once you have achieved nerdvana, it can be
very hard to go back to waiting for a lengthy *code*-*build*-*deploy*-*test* process.

`uiDeveloperNerdvana.js` is a sample for `toxy` to help you acheive nerdvana. What it does
is pretty simple. It looks at the requests coming in, and routes requests beginning with `/api`
or `/login` to the host of your choice.

In other words, if you're developing in JavaScript, TypeScript, or nearly any other modern
UI technology where the browser executes your UI code, and the backend code is served by
somewhere else, you can setup a common backend server for your UI team. Since the UI code
is executed by the browser anyways; there's no reason to deploy it anywhere. If you're using
`gulp` or `webpack`, you can use their `watch` features to automatically build. So *Save* becomes
your *Deploy*.

By changing the backend host, you can test against Production, or a particular QA persons
machine if they've setup a tricky to reproduce bug.

Nerdvana also implements some poisons for toxy that can be controlled from the command line.

## Ok, so how do I get started?

1. Copy this file to your UI project.
2. Add toxy to your package.json
3. Change `defaultBackend` in the code to match the API host name you want to use.
4. Change `apiRoots` if you're using something other than `/api` or `/login` as your
API route in the backend.
5. If serving your front end content from something other than the current directory, or
`./build` or `./dist`, modify staticDirs.
6. Setup `watch` in your build system.
7. Load your UI by going to the opening page.
8. Make a change and save it.
9. Refresh your browser.
10. *Do Victory Dance*


### Advanced Features & Options

Rather than parse a command line, nerdvana will read certain values from the command line.

#### Repoint the proxy


Ex: `HOST=<new host> node nerdvana.js`. will use the specified host instead of the
defaultBackend value. Same thing with `PORT=`. This is very useful to point a production or
a special build of the backend.

#### Cause errors to make sure your UI is robust

`POISONRATE=25` will cause 25% of the API requests to return an error so you can make sure
your UI will work when people's network connection is unreliable.

`MAXLATENCY=5000` will cause each API call to take 2.5 to 5 seconds to complete, so you can
debug race conditions, and also see what its like when your your's network connection is slow.
