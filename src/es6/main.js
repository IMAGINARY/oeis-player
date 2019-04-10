import '@babel/polyfill';
import qs from 'query-string';
import axios from 'axios';
import PlayerUI from './components/playerUI';
import MIDIPlayer from './midi/MIDIPlayer';
import Loader from './components/loader';

const MIDI_STORE = 'midi';
const SONG_JSON = 'data.json';

function init() {
  const args = qs.parse(window.location.search);
  const lang = args.lang || 'en';
  let playerUI = null;
  const midiPlayer = new MIDIPlayer();
  const loader = new Loader();

  if (args.song !== undefined) {
    $('#main').append(
      $('<div>').addClass('container').append(
        $('<div>').addClass('row').append(
          $('<div>').addClass('col').append(
            loader.render()
          )
        )
      )
    );

    return axios.get(SONG_JSON)
      .then(response => response.data)
      .then((database) => {
        const song = database.sequences.find(item => item.id === args.song);
        if (song === undefined) {
          throw new Error(`Song ${args.song} not found in database`);
        }
        return song;
      })
      .then((song) => {
        playerUI = new PlayerUI({ song, lang });
        $('#main')
          .empty()
          .append(playerUI.render());

        $(playerUI.speedButtons).on('selection', (ev, value) => {
          midiPlayer.changeSpeed(1.0 / value);
        });

        $(playerUI.instrumentButtons).on('selection', (ev, value) => {
          midiPlayer.changeInstrument(value);
        });

        $(playerUI.playButton).on('click', () => {
          if (midiPlayer.isPlaying()) {
            midiPlayer.stop();
          } else {
            midiPlayer.play();
          }
        });

        $(midiPlayer).on('instrument:load', (ev, instrumentName) => {
          playerUI.instrumentButtons.enable(instrumentName);
        });

        $(midiPlayer).on('play:start', () => {
          playerUI.playButton.setPlaying(true);
        });

        $(midiPlayer).on('play:stop', () => {
          playerUI.playButton.setPlaying(false);
        });

        return midiPlayer.loadMIDIFile(
          `${MIDI_STORE}/${song.id}.mid`,
          Object.values(PlayerUI.INSTRUMENTS)
        );
      })
      .then(() => {
        //
        // MIDI file and basic instruments loaded, ready to play
        //
        playerUI.speedButtons.enableAll();
        playerUI.playButton.enable();
        midiPlayer.play();
      });
  }
  throw new Error('No song indicated as argument');
}

$(() => {
  init();
});
