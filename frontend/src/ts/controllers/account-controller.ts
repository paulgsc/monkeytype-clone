import {
  GithubAuthProvider,
  GoogleAuthProvider,
  User as UserType,
} from "firebase/auth";
import Ape from "../ape";
import * as Loader from "../elements/loader";
import * as Notifications from "../elements/notifications";
import * as SignInOutButton from "../elements/sign-in-out-button";
import * as Settings from "../pages/settings";
import * as PageTransition from "../states/page-transition";
import * as URLHandler from "../utils/url-handler";

import * as ConnectionState from "../states/connection";
import { navigate } from "./route-controller";

export const gmailProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

async function sendVerificationEmail(): Promise<void> {
  Loader.show();
  $(".sendVerificationEmail").prop("disabled", true);
  const result = await Ape.users.verificationEmail();
  $(".sendVerificationEmail").prop("disabled", false);
  if (result.status !== 200) {
    Loader.hide();
    Notifications.add(
      "Failed to request verification email: " + result.message,
      -1
    );
  } else {
    Loader.hide();
    Notifications.add("Verification email sent", 1);
  }
}

async function readyFunction(
  authInitialisedAndConnected: boolean,
  user: UserType | null
): Promise<void> {
  const search = window.location.search;
  const hash = window.location.hash;
  console.debug(`account controller ready`);
  if (authInitialisedAndConnected) {
    console.debug(`auth state changed, user ${user ? true : false}`);
    console.debug(user);

    if (window.location.pathname === "/account") {
      window.history.replaceState("", "", "/login");
    }
    PageTransition.set(false);
    navigate();
  } else {
    console.debug(`auth not initialised or not connected`);
    if (window.location.pathname === "/account") {
      window.history.replaceState("", "", "/login");
    }
    PageTransition.set(false);
    navigate();
  }

  SignInOutButton.update();

  URLHandler.loadCustomThemeFromUrl(search);
  URLHandler.loadTestSettingsFromUrl(search);
  URLHandler.loadChallengeFromUrl(search);
  void URLHandler.linkDiscord(hash);

  Settings.updateAuthSections();
}

$((): void => {
  void readyFunction(false, null);
});

$(".pageAccount").on("click", ".sendVerificationEmail", () => {
  if (!ConnectionState.get()) {
    Notifications.add("You are offline", 0, {
      duration: 2,
    });
    return;
  }
  void sendVerificationEmail();
});
