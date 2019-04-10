# oeis-player

On-Line Encyclopedia of Integer Sequences Sonification Player

This is a player of Integer Sequences turned into MIDI files through sonification. 

Created by Eric Londaits for la.la.lab.

## Running

`index.html` accepts the following query string parameters:

- `song`: Song ID to play. Valid song IDs are found in the data.json file.
- `lang`: ISO Language code (default: en). Valid languages are the ones used in the data.json file.

## Compilation

Compilation is not needed unless you want to do modifications.

To compile you'll need to install `yarn` and `node.js`.

Standing in the root directory run

```
yarn
```

to install dependencies. And then

```
gulp
```

to precompile ES6 and SASS sources to JS and CSS respectively.

## License

Copyright 2019 IMAGINARY gGmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

FontAwesome icons (in `assets/img/fa`) Copyright 2019 Fonticons, Inc.
Licensed under the 
[Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/) 