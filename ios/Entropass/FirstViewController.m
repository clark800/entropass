//
//  FirstViewController.m
//  Entropass
//
//  Created by Chris Clark on 5/23/14.
//  Copyright (c) 2014 Rampant Logic. All rights reserved.
//

#import "FirstViewController.h"
#import <CommonCrypto/CommonKeyDerivation.h>


@interface FirstViewController ()

@end

@implementation FirstViewController

static const char B85CHARS[85] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";

void b85encodeWord(unsigned long word, unsigned char* result) {
    int powers[] = {1, 85, 7225, 614125, 52200625};
    for(int i = 0; i < 5; i++)
        result[i] = B85CHARS[(word/powers[4-i]) % 85];
}

void b85encode(unsigned char* data, int bytes, unsigned char* result) {
    int words = bytes/4 + (bytes % 4 == 0 ? 0 : 1);
    for(int i = 0; i < words; i++) {
        unsigned long word = 0;
        for(int j = 0; j < 4; j++) {
            unsigned long temp = (i*4+j < bytes) ? data[i*4+j] : 0;
            word |= temp << 8*(3-j);
        }
        b85encodeWord(word, result + 5*i);
    }
    result[5*words] = 0;
}

- (void)clearFields:(NSNotification *) notification
{
    self.passphrase.text = @"";
    self.passwordDisplay.text = @"";
}

- (NSString*)alphanumeric:(NSData *)data {
    NSString* base64 = [data base64EncodedStringWithOptions:0];
    NSUInteger length = base64.length;
    NSCharacterSet* charactersToRemove = [[NSCharacterSet alphanumericCharacterSet] invertedSet];
    NSString* trimmed = [[base64 componentsSeparatedByCharactersInSet:charactersToRemove] componentsJoinedByString:@""];
    return [trimmed stringByPaddingToLength: length withString: @"0" startingAtIndex:0];
}

- (NSString*)base85:(NSData *)data {
    NSUInteger size = [data length] / sizeof(unsigned char);
    unsigned char* array = (unsigned char*) [data bytes];
    unsigned char* result = (unsigned char *)calloc(2 * size + 1, sizeof(unsigned char));
    b85encode(array, (CC_LONG)size, result);
    NSString* retval = [NSString stringWithUTF8String:(const char*)result];
    free(result);
    return retval;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(clearFields:) name:@"clearFields" object:nil];
	// Do any additional setup after loading the view, typically from a nib.
    self.passphrase.delegate = self;
    self.domain.delegate = self;
    self.passwordLength.delegate = self;
    NSLog(@"Base85: %@", [self base85:[@"abcdefgh12345678" dataUsingEncoding:NSUTF8StringEncoding]]);
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSString*)generatePassword {
    bool useSymbols = self.useSymbols.isOn;
    int rounds = 100;
    int length = MIN(80, self.passwordLength.text.intValue);
    NSString* passphrase = self.passphrase.text;
    NSString* domain = self.domain.text;
    NSString* resetCount = self.resetCount.text;
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString* privateKeyHash = [prefs stringForKey:@"privateKeyHash"];
    if(privateKeyHash == nil)
        privateKeyHash = @"";
    if(resetCount.intValue == 0)
        resetCount = @"";
    
    NSString *secret = [NSString stringWithFormat:@"%@%@%@", passphrase, resetCount, privateKeyHash];
    NSData* secretBytes = [secret dataUsingEncoding:NSUTF8StringEncoding];
    NSData* domainBytes = [domain dataUsingEncoding:NSUTF8StringEncoding];
    unsigned char output[length];
    unsigned const int byteLength = 64;
    CCKeyDerivationPBKDF(kCCPBKDF2, secretBytes.bytes, secretBytes.length, domainBytes.bytes, domainBytes.length, kCCPRFHmacAlgSHA512, rounds, output, byteLength);
    NSData* hash = [NSData dataWithBytes:(const void *)output length:byteLength];
    NSString* encoded = useSymbols ? [self base85:hash] : [self alphanumeric:hash];
    return [encoded substringToIndex:length];
}

- (IBAction)editPasswordLength:(UITextField *)sender {
    sender.text = @"";
}

- (IBAction)editPasswordLengthChange:(UITextField *)sender {
    if(sender.text.length >= 2) {
        if(sender.text.intValue > 80)
            sender.text = @"80";
        [sender resignFirstResponder];
    }
}

- (IBAction)showPassword:(UIButton *)sender {
    self.passwordDisplay.text = [self generatePassword];
    self.passphrase.text = @"";
    [self.view endEditing:YES];
}

- (void)clearPasteboard:(NSTimer *)timer {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = @"";
}

- (IBAction)copyPassword:(UIButton *)sender {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = [self generatePassword];
    self.passphrase.text = @"";
    [self.view endEditing:YES];
    [NSTimer scheduledTimerWithTimeInterval:15.0
                                     target:self
                                   selector:@selector(clearPasteboard:)
                                   userInfo:nil
                                    repeats:NO];
}

- (IBAction)clearAll:(UIButton *)sender {
    self.passphrase.text = @"";
    self.domain.text = @"";
    self.passwordLength.text = @"16";
    self.useSymbols.on = TRUE;
    self.resetCount.text = @"0";
    self.resetCountControl.value = 0;
    self.passwordDisplay.text = @"";
}

- (IBAction)resetCountChanged:(UIStepper *)sender {
    int value = [sender value];
    self.resetCount.text = [NSString stringWithFormat:@"%d", value];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [textField resignFirstResponder];
    return YES;
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    [self.passphrase resignFirstResponder];
    [self.domain resignFirstResponder];
    if(self.passwordLength.text.length == 0)
        self.passwordLength.text = @"0";
    if(self.passwordLength.text.intValue > 80)
        self.passwordLength.text = @"80";
    [self.passwordLength resignFirstResponder];
}

@end
