/* globals MIDI, Replayer, MidiFile */

import { Promise } from 'bluebird';

/**
 * Wrapper around MIDI.js
 */
export default class MIDIPlayer {

  constructor() {
    this.leadChannel = 0;
    this.loadedInstruments = [];
  }

  /**
   * MIDI.js has a bug by which it might ignore program change messages
   * because of the way it processes the queue (ignoring messages <= to
   * current time instead of <). Because I can't be bothered to fix MIDI.js
   * because it'd require being absolutely sure my fix doesn't have unintended
   * side effects I bring you this fix. What it does is finding the first
   * programChange message of each channel and executing it.
   */
  initChannelPrograms() {
    const initedChannels = new Set();
    MIDI.Player.data.filter(m => m[0].event.subtype === 'programChange').forEach((m) => {
      if (!initedChannels.has(m[0].event.channel)) {
        this.leadChannel = m[0].event.channel;
        initedChannels.add(m[0].event.channel);
        MIDI.programChange(m[0].event.channel, m[0].event.programNumber);
      }
    });
  }

  loadInstrument(instrumentName) {
    return new Promise((accept, reject) => {
      if (!(instrumentName in this.loadedInstruments)) {
        if (MIDI.GM.byName[instrumentName] === undefined
          || MIDI.GM.byName[instrumentName].number === undefined) {
          console.error(`Instrument '${instrumentName}' not found`);
          reject();
        } else {
          console.log(`Loading instrument : ${instrumentName}`);
          this.loadedInstruments.push(instrumentName);
          MIDI.loadResource({
            instrument: MIDI.GM.byName[instrumentName].number,
            onsuccess: () => {
              $(this).trigger('instrument:load', instrumentName);
              accept();
            },
            onerror: reject,
          });
        }
      } else {
        accept();
      }
    });
  }


  /**
   * Loads a MIDI file into the global MIDI player and all the instruments
   * it includes.
   *
   * @param {string} path Path to a MIDI file
   * @return {Promise}
   */
  loadMIDIFile(path, alternateInstruments = []) {
    console.log(`Loading MIDI file ${path}`);
    return new Promise((accept, reject) => {
      MIDI.Player.loadFile(path, accept, () => {}, reject);
    }).then(() => {
      const instrumentLoaders = [];
      // Initial instruments
      MIDI.Player.getFileInstruments().forEach((instrumentName) => {
        instrumentLoaders.push(this.loadInstrument(instrumentName));
      });
      // Alternate instruments
      alternateInstruments.forEach((instrumentName) => {
        this.loadInstrument(instrumentName);
      });
      return Promise.all(instrumentLoaders);
    }).then(() => {
      this.initChannelPrograms();
    });
  }


  /**
   * Restart the song but changing the playback speed.
   *
   * This must be called once the song is loaded.
   * This method is hacky... it was created by reading the stop and start functions
   * from the MIDI.js source and copying internal stuff. Might not survive an update.
   *
   * @param {Number} value
   *  Song length factor. 1=normal, 0.5=double speed, 2=half speed
   */
  changeSpeed(value) {
    const isPlaying = MIDI.Player.playing;
    if (isPlaying) {
      MIDI.Player.pause();
    }
    MIDI.Player.timeWarp = value;
    MIDI.Player.replayer = new Replayer(
      MidiFile(MIDI.Player.currentData), MIDI.Player.timeWarp, null, MIDI.Player.BPM
    );
    MIDI.Player.data = MIDI.Player.replayer.getData();
    if (isPlaying) {
      MIDI.Player.start();
    }
  }

  /**
   * Change the instrument
   *
   * The instrument must have been previously loaded
   *
   * @param {string} value
   *  The instrument name
   */
  changeInstrument(value) {
    const isPlaying = MIDI.Player.playing;
    if (isPlaying) {
      MIDI.Player.pause();
    }
    MIDI.programChange(this.leadChannel, MIDI.GM.byName[value].number);
    if (isPlaying) {
      MIDI.Player.start();
    }
  }

  handleStopped() {
    $(this).trigger('play:stop');
  }

  handleStarted() {
    $(this).trigger('play:start');
  }

  play() {
    MIDI.Player.start(() => this.handleStopped());
    this.handleStarted();
  }

  stop() {
    MIDI.Player.stop();
    this.handleStopped();
  }

  isPlaying() {
    return MIDI.Player.playing;
  }
}
