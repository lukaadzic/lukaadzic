# SSH Key and GitHub Push Instructions

1. **Check which SSH key is for your GitHub account:**
   - Run:
     ```sh
     ssh-keygen -lf ~/.ssh/id_ed25519
     ssh-keygen -lf ~/.ssh/id_ed25519_wharton
     ```
   - Compare the SHA256 fingerprint to the one listed in your GitHub SSH keys (https://github.com/settings/keys).

2. **Add the correct key to your SSH agent:**
   - Run:
     ```sh
     ssh-add ~/.ssh/id_ed25519_wharton
     ```
   - (Or use `id_ed25519` if that's the right one.)

3. **Update your SSH config to always use this key for GitHub:**
   - Edit (or create) `~/.ssh/config` and add:
     ```
     Host github.com
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_ed25519_wharton
       IdentitiesOnly yes
     ```
   - (Change the key name if needed.)

4. **Test your SSH connection:**
   - Run:
     ```sh
     ssh -T git@github.com
     ```
   - It should say: `Hi lukaadzic! You've successfully authenticated...`

5. **Push your code:**
   - Run:
     ```sh
     git add .gitignore
     git commit -m "secure: ignore ssh keys"
     git push
     ```

If you see any errors, double-check that the public key is added to your GitHub account and that your SSH agent is using the correct key.
