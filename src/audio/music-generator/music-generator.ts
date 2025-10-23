import * as Tone from "tone";
import { Scale, Note } from "tonal";
import type { TimeCycle, Season } from "./time-cycle";
import type { WeatherType } from "./types";

export type IntensityLevel = "calm" | "alert" | "combat";

interface MusicalState {
  season: Season;
  intensity: IntensityLevel;
  timeOfDay: number;
  weather: WeatherType;
}

export class MusicGenerator {
  private timeCycle: TimeCycle;
  private isStarted: boolean = false;

  // Musical state
  private currentState: MusicalState;
  private currentScale: string[] = [];
  private currentMode: string = "ionian";
  private rootNote: string = "C3";

  // Instrument layers
  private ambientPad: Tone.PolySynth;
  private melody: Tone.Synth;
  private bass: Tone.Synth;
  private percussion: Tone.MembraneSynth;
  private atmosphericNoise: Tone.Noise;

  // Musical sequences
  private melodySequence: Tone.Sequence | null = null;
  private bassSequence: Tone.Sequence | null = null;
  private percussionSequence: Tone.Sequence | null = null;

  // Volume control
  private masterVolume: Tone.Volume;

  // Modal mapping for seasons (parallel modes from C)
  private readonly seasonalModes: Record<Season, string> = {
    spring: "ionian", // C Ionian - bright major
    summer: "mixolydian", // C Mixolydian - sunny folk
    fall: "dorian", // C Dorian - bittersweet
    winter: "aeolian", // C Aeolian - dark minor
  };

  // Intensity creates relative mode jumps
  private readonly intensityModeShifts: Record<
    IntensityLevel,
    { interval: string; mode: string }
  > = {
    calm: { interval: "1P", mode: "ionian" }, // Stay at root
    alert: { interval: "4P", mode: "lydian" }, // Jump to 4th (Lydian - bright/tense)
    combat: { interval: "3M", mode: "phrygian" }, // Jump to 3rd (Phrygian - dark/exotic)
  };

  constructor(timeCycle: TimeCycle) {
    this.timeCycle = timeCycle;

    this.currentState = {
      season: timeCycle.getCurrentSeason(),
      intensity: "calm",
      timeOfDay: timeCycle.getTimeOfDay(),
      weather: timeCycle.getWeather(),
    };

    // Create master volume
    this.masterVolume = new Tone.Volume(-12).toDestination();

    // Create instruments
    this.ambientPad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 },
    }).connect(this.masterVolume);
    this.ambientPad.volume.value = -18;

    this.melody = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8 },
    }).connect(this.masterVolume);
    this.melody.volume.value = -12;

    this.bass = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.2 },
    }).connect(this.masterVolume);
    this.bass.volume.value = -15;

    this.percussion = new Tone.MembraneSynth().connect(this.masterVolume);
    this.percussion.volume.value = -20;

    this.atmosphericNoise = new Tone.Noise("brown").connect(this.masterVolume);
    this.atmosphericNoise.volume.value = -Infinity;

    // Initialize music
    this.updateMusicalSystem();
  }

  /**
   * Start the music engine
   */
  async start() {
    if (this.isStarted) return;

    await Tone.start();
    console.log("🎵 Music Generator started");

    Tone.Transport.bpm.value = 70;
    Tone.Transport.start();

    this.atmosphericNoise.start();
    this.isStarted = true;

    this.startSequences();
  }

  /**
   * Update music based on time cycle and intensity
   */
  update(intensity: IntensityLevel = "calm") {
    if (!this.isStarted) return;

    const newState: MusicalState = {
      season: this.timeCycle.getCurrentSeason(),
      intensity,
      timeOfDay: this.timeCycle.getTimeOfDay(),
      weather: this.timeCycle.getWeather(),
    };

    // Check if we need to update the musical system
    if (
      newState.season !== this.currentState.season ||
      newState.intensity !== this.currentState.intensity
    ) {
      this.currentState = newState;
      this.updateMusicalSystem();
    } else {
      this.currentState = newState;
    }

    // Always update tempo and atmosphere
    this.updateTempo(this.currentState.timeOfDay, this.currentState.season);
    this.updateWeatherAtmosphere(this.currentState.weather);
  }

  /**
   * Core musical system update - handles scale/mode changes
   */
  private updateMusicalSystem() {
    const { season, intensity } = this.currentState;

    // 1. Get seasonal base mode (parallel)
    const seasonalMode = this.seasonalModes[season];

    // 2. Calculate intensity shift (relative)
    const shift = this.intensityModeShifts[intensity];

    // 3. Calculate new root note based on intensity interval
    const newRoot = Note.transpose(this.rootNote, shift.interval);

    // 4. Build the scale from the new root using the intensity mode
    const scaleName = `${Note.get(newRoot).pc} ${shift.mode}`;
    const scale = Scale.get(scaleName);

    if (scale.notes.length === 0) {
      console.error(`Failed to generate scale: ${scaleName}`);
      return;
    }

    // 5. Create full octave scale in correct register
    this.currentScale = scale.notes.map((note) => `${note}3`);
    this.currentMode = shift.mode;

    console.log(`🎼 ${season} (${seasonalMode}) → ${intensity} (${scaleName})`);

    // 6. Restart sequences with new scale
    if (this.isStarted) {
      this.stopSequences();
      this.startSequences();
    }
  }

  /**
   * Start musical sequences with current scale
   */
  private startSequences() {
    const { intensity } = this.currentState;

    // Note subdivisions based on intensity
    const subdivisions = {
      calm: "4n", // Quarter notes (sparse)
      alert: "8n", // Eighth notes (medium)
      combat: "16n", // Sixteenth notes (dense)
    };

    const subdivision = subdivisions[intensity];

    // MELODY SEQUENCE
    const melodyNotes = [
      ...this.currentScale,
      ...this.currentScale.slice(0, 3),
    ];
    this.melodySequence = new Tone.Sequence(
      (time, note) => {
        if (note) {
          this.melody.triggerAttackRelease(note, subdivision, time);
        }
      },
      melodyNotes,
      subdivision
    ).start(0);

    // BASS SEQUENCE - plays root and fifth
    const bassNotes = [
      this.currentScale[0], // Root
      null,
      this.currentScale[4], // Fifth
      null,
    ];

    const bassSubdivision = intensity === "combat" ? "8n" : "4n";
    this.bassSequence = new Tone.Sequence(
      (time, note) => {
        if (note) {
          this.bass.triggerAttackRelease(note, bassSubdivision, time);
        }
      },
      bassNotes,
      bassSubdivision
    ).start(0);

    // PERCUSSION - only in alert/combat
    if (intensity !== "calm") {
      const percPattern =
        intensity === "combat"
          ? ["C2", null, "C2", null, "C2", null, "C2", null]
          : ["C2", null, null, null];

      this.percussionSequence = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.percussion.triggerAttackRelease(note, "32n", time);
          }
        },
        percPattern,
        "16n"
      ).start(0);
    }

    // AMBIENT PAD - sustained chords
    this.playAmbientChord();
  }

  /**
   * Play ambient pad chord
   */
  private playAmbientChord() {
    // Build triad from current scale
    const chord = [
      this.currentScale[0], // Root
      this.currentScale[2], // Third
      this.currentScale[4], // Fifth
    ];

    // Play chord and schedule next one
    this.ambientPad.triggerAttackRelease(chord, "2m");

    Tone.Transport.scheduleOnce(() => {
      if (this.isStarted) {
        this.playAmbientChord();
      }
    }, "+2m");
  }

  /**
   * Stop all sequences
   */
  private stopSequences() {
    this.melodySequence?.stop();
    this.melodySequence?.dispose();
    this.melodySequence = null;

    this.bassSequence?.stop();
    this.bassSequence?.dispose();
    this.bassSequence = null;

    this.percussionSequence?.stop();
    this.percussionSequence?.dispose();
    this.percussionSequence = null;

    Tone.Transport.cancel();
  }

  /**
   * Update tempo based on time of day and season
   */
  private updateTempo(timeOfDay: number, season: Season) {
    // Base tempo per season
    const baseBpm = {
      spring: 75,
      summer: 80,
      fall: 65,
      winter: 60,
    }[season];

    let targetBpm = baseBpm;

    // Time of day modulation
    if (timeOfDay >= 5 && timeOfDay < 8) {
      // Dawn - ramping up
      const progress = (timeOfDay - 5) / 3;
      targetBpm = baseBpm - 15 + progress * 15;
    } else if (timeOfDay >= 8 && timeOfDay < 18) {
      // Day - full energy
      targetBpm = baseBpm + 5;
    } else if (timeOfDay >= 18 && timeOfDay < 21) {
      // Dusk - winding down
      const progress = (timeOfDay - 18) / 3;
      targetBpm = baseBpm + 5 - progress * 20;
    } else {
      // Night - slowest
      targetBpm = baseBpm - 15;
    }

    Tone.Transport.bpm.rampTo(targetBpm, 2);
  }

  /**
   * Update atmospheric noise based on weather
   */
  private updateWeatherAtmosphere(weather: WeatherType) {
    const targetVolume: Record<WeatherType, number> = {
      clear: -Infinity,
      raining: -25,
      snowing: -30,
    }[weather];

    this.atmosphericNoise.volume.rampTo(targetVolume, 1);
  }

  /**
   * Handle season changes
   */
  onSeasonChange(newSeason: Season) {
    console.log(`🍂 Season changed to ${newSeason}`);
    this.currentState.season = newSeason;
    this.updateMusicalSystem();
  }

  /**
   * Stop music
   */
  stop() {
    this.stopSequences();
    Tone.Transport.stop();
    this.atmosphericNoise.stop();
    this.isStarted = false;
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number) {
    const dbVolume = -30 + volume * 30;
    this.masterVolume.volume.value = dbVolume;
  }

  /**
   * Get current musical state for debugging
   */
  getState() {
    return {
      ...this.currentState,
      scale: this.currentScale,
      mode: this.currentMode,
      bpm: Tone.Transport.bpm.value,
    };
  }
}
