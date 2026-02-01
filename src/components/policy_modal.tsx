import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

export type PolicyType = "terms" | "privacy";

interface PolicyModalProps {
  visible: boolean;
  policyType: PolicyType;
  onClose: () => void;
}

export default function PolicyModal({
  visible,
  policyType,
  onClose,
}: PolicyModalProps) {
  const isTerms = policyType === "terms";

  const getContent = () => {
    if (isTerms) {
      return {
        title: "Terms of Service",
        content: `TERMS OF SERVICE

Last Updated: January 27, 2026

1. ACCEPTANCE OF TERMS
By accessing and using EventScape, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily download one copy of the materials (information or software) on EventScape for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to decompile or reverse engineer any software contained on EventScape
- Remove any copyright or other proprietary notations from the materials
- Transfer the materials to another person or "mirror" the materials on any other server

3. DISCLAIMER
The materials on EventScape are provided on an 'as is' basis. EventScape makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. LIMITATIONS
In no event shall EventScape or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EventScape.

5. ACCURACY OF MATERIALS
The materials appearing on EventScape could include technical, typographical, or photographic errors. EventScape does not warrant that any of the materials on EventScape are accurate, complete, or current.

6. LINKS
EventScape has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by EventScape of the site. Use of any such linked website is at the user's own risk.

7. MODIFICATIONS
EventScape may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.

8. GOVERNING LAW
These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where EventScape operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`,
      };
    } else {
      return {
        title: "Privacy Policy",
        content: `PRIVACY POLICY

Last Updated: January 27, 2026

1. INTRODUCTION
EventScape ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

2. INFORMATION WE COLLECT
We may collect information about you in a variety of ways. The information we may collect on the Site includes:

Personal Data:
- Name
- Email address
- Phone number
- Event preferences and details
- Payment information

Automatic Data Collection:
- Log files
- IP addresses
- Browser type and version
- Access times and dates
- Referring website

3. USE OF YOUR INFORMATION
Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
- Create and manage your account
- Process your transactions and send related information
- Email you regarding your account or subscription
- Fulfill and manage purchases
- Generate a personal profile about you
- Increase the efficiency and operation of the Site
- Monitor and analyze usage and trends

4. DISCLOSURE OF YOUR INFORMATION
We may share or disclose your information in the following situations:
- By Law or to Protect Rights
- Third Party Service Providers
- Business Transfers
- With Your Consent

5. SECURITY OF YOUR INFORMATION
We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

6. CONTACT US
If you have questions or comments about this Privacy Policy, please contact us at:
Email: privacy@eventscape.com
Address: [Company Address]

7. UPDATES TO THIS POLICY
We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by updating the "Last Updated" date of this Privacy Policy.`,
      };
    }
  };

  const { title, content } = getContent();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <Text style={styles.contentText}>{content}</Text>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Pressable
            style={styles.acceptButton}
            onPress={onClose}
          >
            <Text style={styles.acceptButtonText}>I Understand</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    marginTop: Theme.spacing.lg,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: Theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: Theme.colors.muted,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
  },
  contentText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  footer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  acceptButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
