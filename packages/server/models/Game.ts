import { Collection } from "@shared/collection";
import { BaseGame } from "@shared/model/BaseGame";
import { boundMethod } from "autobind-decorator";

import { GameController } from "../controller/GameController";
import { World } from "../core/World";
import { BonusManager } from "../manager/BonusManager";
import { Avatar } from "../models/Avatar";
import { AvatarBody } from "../models/AvatarBody";
import { GameBonusStack } from "../models/GameBonusStack";
import { Room } from "../models/Room";

/**
 * Game
 */
export class Game extends BaseGame {
  deaths: Collection<any>;
  controller: GameController;
  bonusStack: any;
  roundWinner: any;
  gameWinner: any;
  deathInFrame: boolean;

  /** OVERRIDE */
  declare world: World;
  declare room: Room;
  avatars: Collection<Avatar> = new Collection<Avatar>();
  bonusManager: BonusManager;

  declare getLoadingAvatars: () => Collection<Avatar>;

  constructor(room: Room) {
    super(room);
    this.bonusManager = new BonusManager(
      this,
      room.config.getBonuses(),
      room.config.getVariable("bonusRate")
    );
    this.world = new World(this.size);
    this.deaths = new Collection([], "id");
    this.controller = new GameController(this);
    this.bonusStack = new GameBonusStack(this);
    this.roundWinner = null;
    this.gameWinner = null;
    this.deathInFrame = false;
    this.avatars = this.room.players.map<Avatar>(
      (player) => player.getAvatar() as Avatar
    );

    let avatar: Avatar;
    let i: number;
    for (i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];
      avatar.clear();
      avatar.on("point", this.onPoint);
    }
  }

  /**
   * Update
   */
  update(step: number) {
    const score = this.deaths.count();
    let avatar: Avatar;
    let border: any[];
    let i: number;
    let position: any[];
    let killer: AvatarBody;
    this.deathInFrame = false;
    for (i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];

      if (avatar.alive) {
        avatar.update(step);
        border = this.world.getBoundIntersect(
          avatar.body,
          this.borderless ? 0 : avatar.radius
        );
        if (border) {
          if (this.borderless) {
            position = this.world.getOposite(border[0], border[1]);
            avatar.setPosition(position[0], position[1]);
          } else {
            this.kill(avatar, null, score);
          }
        } else {
          if (!avatar.invincible) {
            killer = this.world.getBody(avatar.body) as AvatarBody;
            if (killer) {
              this.kill(avatar, killer, score);
            }
          }
        }
        if (avatar.alive) {
          avatar.printManager.test();
          this.bonusManager.testCatch(avatar);
        }
      }
    }
    if (this.deathInFrame) {
      this.checkRoundEnd();
    }
  }

  /**
   * Kill an avatar
   */
  kill(avatar: Avatar, killer: AvatarBody | null, score: number) {
    avatar.die(killer);
    avatar.addScore(score);
    this.deaths.add(avatar);
    this.deathInFrame = true;
  }

  /**
   * Remove a avatar from the game
   */
  removeAvatar(avatar: Avatar) {
    super.removeAvatar(avatar);
    this.emit("player:leave", { player: avatar.player });
    this.checkRoundEnd();
  }

  /**
   * Is done
   */
  isWon(): Avatar | null | boolean {
    const present = this.getPresentAvatars().count();
    if (present <= 0) {
      return true;
    }
    if (this.avatars.count() > 1 && present <= 1) {
      return true;
    }
    const maxScore = this.maxScore;
    const players = this.avatars.filter(
      (avatar) => avatar.present && avatar.score >= maxScore
    );
    if (players.count() === 0) {
      return null;
    }
    if (players.count() === 1) {
      return players.getFirst();
    }
    this.sortAvatars(players);
    return players.items[0].score === players.items[1].score
      ? null
      : players.getFirst();
  }

  /**
   * Check if the round should end
   */
  checkRoundEnd() {
    if (!this.inRound) {
      return;
    }
    let alive = false;
    for (let i = this.avatars.items.length - 1; i >= 0; i--) {
      if (this.avatars.items[i].alive) {
        if (!alive) {
          alive = true;
        } else {
          return;
        }
      }
    }
    this.endRound();
  }

  /**
   * Resolve scores
   */
  resolveScores() {
    let winner: Avatar;
    if (this.avatars.count() === 1) {
      winner = this.avatars.getFirst();
    } else {
      winner = this.avatars.match((avatar) => avatar.alive);
    }
    if (winner) {
      winner.addScore(Math.max(this.avatars.count() - 1, 1));
      this.roundWinner = winner;
    }
    for (let i = this.avatars.items.length - 1; i >= 0; i--) {
      this.avatars.items[i].resolveScore();
    }
  }

  /**
   * Clear trails
   */
  clearTrails() {
    this.world.clear();
    this.world.activate();
    this.emit("clear", { game: this });
  }

  /**
   * Update size
   */
  setSize() {
    super.setSize();
    this.world.clear();
    this.world = new World(this.size);
    this.bonusManager.setSize();
  }

  /**
   * Check end of round
   */
  onRoundEnd() {
    this.resolveScores();
    this.emit("round:end", { winner: this.roundWinner });
  }

  /**
   * New round
   */
  onRoundNew() {
    this.emit("round:new", { game: this });
    super.onRoundNew();
    let avatar: Avatar;
    let position: any[];
    let i: number;
    this.roundWinner = null;
    this.world.clear();
    this.deaths.clear();
    this.bonusStack.clear();
    for (i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];
      if (avatar.present) {
        position = this.world.getRandomPosition(
          avatar.radius,
          BaseGame.spawnMargin
        );
        avatar.setPosition(position[0], position[1]);
        avatar.setAngle(
          this.world.getRandomDirection(
            avatar.x,
            avatar.y,
            BaseGame.spawnAngleMargin
          )
        );
      } else {
        this.deaths.add(avatar);
      }
    }
  }

  /**
   * On start
   */
  onStart() {
    this.emit("game:start", { game: this });
    for (let avatar: Avatar, i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];
      setTimeout(avatar.printManager.start, 3000);
    }
    this.world.activate();
    super.onStart();
  }

  /**
   * On stop
   */
  onStop() {
    this.emit("game:stop", { game: this });
    super.onStop();
    const won = this.isWon();
    if (won) {
      if (won instanceof Avatar) {
        this.gameWinner = won;
      }
      this.end();
    } else {
      this.newRound();
    }
  }

  /**
   * Set borderless
   */
  setBorderless(borderless: boolean) {
    if (this.borderless !== borderless) {
      super.setBorderless(borderless);
      this.emit("borderless", this.borderless);
    }
  }

  /**
   * FIN DU GAME
   */
  @boundMethod
  end() {
    const hasEnded = super.end();
    if (super.end()) {
      this.avatars.clear();
      this.world.clear();
      delete this.world;
      delete this.avatars;
      delete this.deaths;
      delete this.bonusManager;
      delete this.controller;
    }
    return hasEnded;
  }

  /**
   * On avatar add point
   */
  onPoint({ x, y, avatar }: { x: number; y: number; avatar: Avatar }) {
    if (this.started && this.world.active) {
      this.world.addBody(new AvatarBody(x, y, avatar));
    }
  }
}