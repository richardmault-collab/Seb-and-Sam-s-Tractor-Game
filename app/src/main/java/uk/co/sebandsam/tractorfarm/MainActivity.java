package uk.co.sebandsam.tractorfarm;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/**
 * Full-screen, strictly offline Android host for the farm.
 * All graphics and sound synthesis live inside bundled HTML assets.
 */
public class MainActivity extends Activity {
    private WebView webView;
    private TextToSpeech textToSpeech;
    private volatile boolean ttsReady = false;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );

        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && textToSpeech != null) {
                int result = textToSpeech.setLanguage(Locale.UK);
                ttsReady = result != TextToSpeech.LANG_MISSING_DATA
                        && result != TextToSpeech.LANG_NOT_SUPPORTED;
                textToSpeech.setSpeechRate(0.88f);
                textToSpeech.setPitch(1.13f);
            }
        });

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF78D8FF);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        WebView.setWebContentsDebuggingEnabled(false);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().equals("file:///android_asset/index.html");
            }
        });
        webView.addJavascriptInterface(new FarmSpeech(), "FarmAndroid");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private final class FarmSpeech {
        @JavascriptInterface
        public void speak(String words) {
            if (!ttsReady || textToSpeech == null || words == null) return;
            final String safeWords = words.length() > 100 ? words.substring(0, 100) : words;
            runOnUiThread(() -> {
                if (ttsReady && textToSpeech != null) {
                    textToSpeech.speak(safeWords, TextToSpeech.QUEUE_FLUSH, null, "farm-word");
                }
            });
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.evaluateJavascript("window.setAppPaused(true)", null);
        if (textToSpeech != null) textToSpeech.stop();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.evaluateJavascript("window.setAppPaused(false)", null);
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript("window.goHome()", result -> {
            if ("false".equals(result)) finish();
        });
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
