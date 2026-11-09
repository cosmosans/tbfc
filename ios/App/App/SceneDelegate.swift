import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        let controller = ClubBridgeViewController()
        window?.rootViewController = controller
        window?.makeKeyAndVisible()
        if let splash = UIStoryboard(name: "LaunchScreen", bundle: nil)
            .instantiateInitialViewController()?.view, let window {
            splash.frame = window.bounds
            splash.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            window.addSubview(splash)
            let deadline = Date().addingTimeInterval(8)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                self.dismissSplashWhenReady(splash, controller: controller, deadline: deadline)
            }
        }

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    private func dismissSplashWhenReady(_ splash: UIView, controller: ClubBridgeViewController, deadline: Date) {
        guard let webView = controller.webView, Date() < deadline else {
            splash.removeFromSuperview()
            return
        }
        webView.evaluateJavaScript("Boolean(document.querySelector('#root')?.childElementCount)") { result, _ in
            if result as? Bool == true {
                splash.removeFromSuperview()
            } else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.dismissSplashWhenReady(splash, controller: controller, deadline: deadline)
                }
            }
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
