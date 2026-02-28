import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type WingoBetType = {
    #numberValue : { value : Nat };
    #color : { color : { #red; #green } };
    #violet;
  };

  public type WingoGameResult = {
    winningNumber : Nat;
    colorResult : {
      #red;
      #green;
      #violet;
    };
  };

  public type WingoBet = {
    player : Principal;
    roundId : Nat;
    betType : WingoBetType;
    amount : Nat;
    roundResult : ?WingoGameResult;
  };

  public type WingoRound = {
    id : Nat;
    startTime : Int;
    endTime : Int;
    winningNumber : ?Nat;
    colorResult : ?{
      #red;
      #green;
      #violet;
    };
  };

  module WingoRound {
    public func compare(a : WingoRound, b : WingoRound) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module WingoBet {
    public func compare(a : WingoBet, b : WingoBet) : Order.Order {
      Nat.compare(a.roundId, b.roundId);
    };
  };

  let rounds = Map.empty<Nat, WingoRound>();
  let bets = Map.empty<Nat, WingoBet>();
  var currentRoundId = 0;
  var betCounter = 0;

  // Any caller (including guests) can view the current round state
  public query ({ caller }) func getCurrentRound() : async WingoRound {
    let now = Time.now();
    let remainingTime = Int.max(0, 30_000_000_000 - ((now - (now / 30_000_000_000) * 30_000_000_000)));
    {
      id = currentRoundId;
      startTime = 0;
      endTime = remainingTime;
      winningNumber = null;
      colorResult = null;
    };
  };

  // Any caller (including guests) can view round history
  public query ({ caller }) func getRoundHistory(limit : Nat) : async [WingoRound] {
    rounds.values().toArray().sort().sliceToArray(0, Nat.min(limit, rounds.size()));
  };

  // Only authenticated users can view their own bet history; admins can view all bets
  public query ({ caller }) func getBetHistory(limit : Nat) : async [WingoBet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bet history");
    };
    let allBets = bets.values().toArray().sort();
    let filtered = if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admins can see all bets
      allBets
    } else {
      // Regular users can only see their own bets
      allBets.filter(func(b : WingoBet) : Bool { b.player == caller })
    };
    filtered.sliceToArray(0, Nat.min(limit, filtered.size()));
  };

  // Only authenticated users can place bets
  public shared ({ caller }) func placeBet(roundId : Nat, betType : WingoBetType, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place bets");
    };

    if (amount < 1) {
      Runtime.trap("Invalid amount, cannot be smaller than 1 ICP bits.");
    };

    if (roundId != currentRoundId) {
      Runtime.trap("Bet is on an invalid round.");
    };

    let round = switch (rounds.get(roundId)) {
      case (null) {
        Runtime.trap("Round does not exist.");
      };
      case (?r) { r };
    };

    let now = Time.now();
    if (now > round.endTime) {
      Runtime.trap("Round has already ended.");
    };

    bets.add(
      betCounter,
      {
        player = caller;
        roundId;
        betType;
        amount;
        roundResult = null;
      },
    );
    betCounter += 1;
  };

  // Only admins can resolve rounds
  public shared ({ caller }) func resolveRound(roundId : Nat, winningNumber : Nat, colorResult : { #red; #green; #violet }) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can resolve round.");
    };

    let updatedRound = {
      id = roundId;
      startTime = 0;
      endTime = 0;
      winningNumber = ?winningNumber;
      colorResult = ?colorResult;
    };

    rounds.add(roundId, updatedRound);
    currentRoundId += 1;
  };
};
