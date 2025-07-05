// Fichier : android/app/src/main/java/com/monjeu/MainActivity.kt
// VERSION CORRIGÉE ET COMPLÈTE

package com.monjeu

// NOUVEL IMPORT NÉCESSAIRE pour la configuration native
import android.os.Bundle;

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MonJeu"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // ===================================================================
  // NOUVEAU BLOC DE CODE AJOUTÉ ICI
  // C'est la configuration requise par les librairies react-native-gesture-handler
  // et react-native-screens pour fonctionner correctement.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
  // ===================================================================
}