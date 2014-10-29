//
//  SecondViewController.m
//  Entropass
//
//  Created by Chris Clark on 5/23/14.
//  Copyright (c) 2014 Rampant Logic. All rights reserved.
//

#import "SecondViewController.h"
#include <CommonCrypto/CommonDigest.h>

@interface SecondViewController ()

@end

@implementation SecondViewController

- (void)updateFingerprint
{
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString* privateKeyHash = [prefs stringForKey:@"privateKeyHash"];
    if(privateKeyHash != nil) {
        int length = CC_SHA512_DIGEST_LENGTH;
        const char *string = [privateKeyHash cStringUsingEncoding:NSUTF8StringEncoding];
        NSData *data = [NSData dataWithBytes:string length:privateKeyHash.length];
        uint8_t digest[length];
        CC_SHA512(data.bytes, (CC_LONG)data.length, digest);
        NSMutableString* fingerprint = [NSMutableString stringWithCapacity:length * 2];
        for(int i = 0; i < length; i++)
            [fingerprint appendFormat:@"%02x", digest[i]];
        self.fingerprint.text = [fingerprint substringToIndex:8];
    } else {
        self.fingerprint.text = @"";
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    self.privateKeyHash.delegate = self;
    [self updateFingerprint];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)savePrivateKeyHash {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    [prefs setObject:self.privateKeyHash.text forKey:@"privateKeyHash"];
    [prefs synchronize];
    [self updateFingerprint];
    [self.privateKeyHash resignFirstResponder];
}

- (IBAction)save:(id)sender {
    if(self.privateKeyHash.text.length > 0) {
        NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
        NSString* savedPrivateKeyHash = [prefs stringForKey:@"privateKeyHash"];
        if(savedPrivateKeyHash != nil) {
            NSString* title = @"Replace existing private key?";
            UIActionSheet *actionSheet = [[UIActionSheet alloc] initWithTitle:title delegate:self cancelButtonTitle:@"Cancel"   destructiveButtonTitle:@"Replace" otherButtonTitles:nil];
            [actionSheet showInView:self.view];
        } else {
            [self savePrivateKeyHash];
        }
        self.privateKeyHash.text = @"";
    }
}

- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex {
    NSString *buttonTitle = [actionSheet buttonTitleAtIndex:buttonIndex];
    if([buttonTitle isEqualToString:@"Replace"]) {
        [self savePrivateKeyHash];
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [textField resignFirstResponder];
    return YES;
}
@end
